# Directus i18n for System Emails

This extension allows you to translate system emails (user invitation, user registration, password reset) per user.

<br />

---

<br />

## Installation

There are multiple way to install an extension.

Check the [official Directus guide](https://docs.directus.io/extensions/installing-extensions.html) for more information.

> Mind that in order to see this in the (self-hosted and Enterprise Cloud) Directus Marketplace, you would need to allow non-sandboxed extensions ([see docs](https://docs.directus.io/self-hosted/config-options.html#marketplace)).

<br />

---

<br />

## How it works

* The extension is a hook, which filters all emails sent by Directus.
* When we are dealing with a system email, it would check for the user's language.
* If this language is not English, it would look for an email template with a language suffix and a subject in a respective environment variable `I18N_EMAIL_SUBJECTS`.

<br />

> **Warning:**  
> When you are using this extension, you need to make sure that for every system email type and used language, you have a [liquid template](https://docs.directus.io/self-hosted/email-templates.html) set up.  
> If a template is missing, emails might not get sent.

<br />

---

<br />

## Example

Let's assume...

* you are offering English (default) and German as potential languages.  
* you are not offering user invites and have no user registration DOI.
* so, we only need to translate the password-reset emails.

1. You would create a template `password-reset` (for English) and a template `password-reset-de` (for German).
2. You would add an environment variable `I18N_EMAIL_SUBJECTS` with content `{"de":{"password-reset": "Passwort zurücksetzen"}}`.

That's it.

If you would now add Spanish:

1. add a template `password-reset-es`
2. adjust the env var to something like `{"de":{"password-reset": "Passwort zurücksetzen"}, "es":{"password-reset": "Restablecer contraseña"}}`

<br />

---

<br />

## Contributing

Anyone is welcome to contribute, but mind the [guidelines](.github/CONTRIBUTING.md):

- [Bug reports](.github/CONTRIBUTING.md#bugs)
- [Feature requests](.github/CONTRIBUTING.md#features)
- [Pull requests](.github/CONTRIBUTING.md#pull-requests)
