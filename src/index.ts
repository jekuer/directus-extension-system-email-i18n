import { defineHook } from '@directus/extensions-sdk';
import type { Accountability} from '@directus/types';

interface I18nSubjects {
	[key: string]: {
		[key: string]: string;
	};
}

export default defineHook(({ filter }, { services, logger, getSchema, env }) => {
	const { ItemsService } = services;

	filter('email.send', async (input: any) => {
		
		if (!input.template) {
			return input;
		}

		const templateName = input.template.name;

		if (['password-reset', 'user-invitation', 'user-registration'].includes(templateName)) {	
			try {
				 // pull in any subject translation form the environment variable I18N_EMAIL_SUBJECTS (scheme: {"de": {"password-reset": "Passwort zurücksetzen", ...}, ...})
				// TODO: Could also become a setting somewhere in the Directus app as an alternative to the environment variable
				let i18nEmailSubjects: I18nSubjects = {};
				try {
					i18nEmailSubjects = typeof env.I18N_EMAIL_SUBJECTS === 'object' 
						? env.I18N_EMAIL_SUBJECTS 
						: JSON.parse(env.I18N_EMAIL_SUBJECTS || '{}');
				} catch (err) {
					logger.error('Failed to parse I18N_EMAIL_SUBJECTS:', err);
				}

				// preparing the accountability object to be able searching directus users with admin rights
				// this includes a lot of empty props, which is necessary to match the type of the accountability object
				const adminAccountability: Accountability = {
					role: null,
					roles: [],
					user: null,
					admin: true,
					app: false,
					ip: null,
					origin: 'user language lookup by extension'
				};

				// get the default language
				try {
					const settings = new ItemsService('directus_settings', { 
						schema: await getSchema(), 
						accountability: adminAccountability 
					});
					const settingsResponse = await settings.readSingleton({
						fields: ['default_language'],
					});
					const defaultLang = settingsResponse?.default_language?.split('-')[0] || 'en';
					// get the language from searching and reading the user
					const users = new ItemsService('directus_users', { schema: await getSchema(), accountability: adminAccountability }); 
					const response = await users.readByQuery({
						filter: {
							email: {
								_eq: input.to
							}
						},
						fields: ['language'],
						limit: 1
					});
					const lang = response[0]?.language?.split('-')[0] ? response[0].language.split('-')[0] : defaultLang;

					// override the subject with the translation from the environment variable (if available)
					input.subject = i18nEmailSubjects[lang] && i18nEmailSubjects[lang][templateName] ? i18nEmailSubjects[lang][templateName] : input.subject;
					// override template for non-default languages
					if (lang !== defaultLang) {
						input.template.name = templateName + '-' + lang;
					}
				} catch (err) {
					logger.error('Failed to fetch settings:', err);
				}
			} catch (err) {
				logger.error('Error in email.send filter:', err);
			}
		}
		return input;
	});
});
