import { defineHook } from '@directus/extensions-sdk';
import ip from 'ip';
import type { Accountability} from '@directus/types';

export default defineHook(({ filter }, { services, getSchema, env }) => {
	const { ItemsService } = services;

	filter('email.send', async (input: any) => {

		if (['password-reset', 'user-invitation', 'user-registration'].includes(input.template.name)) {
			// pull in any subject translation form the environment variable I18N_EMAIL_SUBJECTS (scheme: {"de": {"password-reset": "Passwort zurücksetzen", ...}, ...})
			const i18nEmailSubjects = JSON.parse(env.I18N_EMAIL_SUBJECTS);
			// take IP from the server this script is running on
			const systemIp = ip.address();
			// preparing the accountability object to be able searching directus users with admin rights
			const adminAccountability:Accountability = { role: null, roles: [], user: null, admin: true, app: false, ip: systemIp, origin: 'user language lookup by extension' };
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
			const lang = response[0].language?.split('-')[0] ? response[0].language.split('-')[0] : 'en';
			// override for non-English languages
			if (lang !== 'en') {
				input.subject = i18nEmailSubjects[lang][input.template.name] || input.subject;
				input.template.name = input.template.name + '-' + lang;
			}	
    }

    return input
  })
});
