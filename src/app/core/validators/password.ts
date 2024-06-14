import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from "@angular/forms";

/**
 * Utility class for password validation.
 * Provides static methods to create validators for password complexity and matching passwords.
 */
export class PasswordValidation {

    /**
     * Creates a ValidatorFn that checks if the control's value meets the specified password requirements.
     * Ensures the password contains at least one digit, one lowercase letter, one uppercase letter,
     * and is at least 8 characters long.
     *
     * @param controlName The name of the form control to validate (optional).
     * @returns A ValidatorFn that returns validation errors or null if the control's value is valid.
     */
    public static passwordProto(controlName: string = ''): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            let password = '';

            // Get the value from the control, supporting both FormControl and FormGroup
            if (control instanceof FormControl)
                password = control?.value;
            else
                password = control.get(controlName)?.value;

            // Validate the password against the regex pattern
            if (password && !password.match(/^(?=.*\d)(?=.*[a-zá-ú\u00f1ä-ü])(?=.*[A-ZÁ-Ú\u00d1Ä-Ü])[0-9a-zá-úä-üA-ZÁ-ÚÄ-Ü \u00d1$-/@:-?{-~!"^_`\[\]]{8,}$/)) {
                return { 'passwordProto': true };
            } else {
                return null;
            }
        }
    }

    /**
     * Creates a ValidatorFn that checks if the password and confirm password fields match.
     *
     * @param passwordControlName The name of the password control.
     * @param confirmControlName The name of the confirm password control.
     * @returns A ValidatorFn that returns validation errors or null if the control's values match.
     */
    public static passwordMatch(passwordControlName: string, confirmControlName: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const password = control.get(passwordControlName)?.value;
            const confirmPassword = control.get(confirmControlName)?.value;

            // Check if the passwords match
            if (password != confirmPassword) {
                let errors = control?.errors;
                if (errors && typeof errors === 'object') {
                    Object.assign(errors, {
                        'passwordMatch': true
                    });
                } else {
                    errors = {
                        'passwordMatch': true
                    };
                }
                return errors;
            } else {
                let errors = control?.errors;
                if (errors && typeof errors === 'object') {
                    if (errors['passwordMatch'])
                        delete errors['passwordMatch'];
                }
                return control.errors;
            }
        }
    }
}
