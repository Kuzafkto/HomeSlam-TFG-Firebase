import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * A class containing numeric validation logic for Angular forms.
 */
export class NumericValidator {

    /**
     * Creates a ValidatorFn that checks if the control's value is a valid number.
     * This validator supports both positive and negative numbers, with up to two decimal places.
     *
     * @param formControlName The name of the form control to validate (optional). Useful for FormGroup.
     * @returns A ValidatorFn that returns validation errors or null if the control's value is valid.
     */
    public static numericProto(formControlName: string = ''): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            let value = '';

            // Get the value from the control, supporting both FormControl and FormGroup
            if (control instanceof FormControl) {
                value = control?.value;
            } else {
                value = control.get(formControlName)?.value;
            }

            let errors = control?.errors;

            // If the field is empty, consider the validation passed (unless the field is required)
            if (value === null || value === '') {
                return errors; // May need to handle required validation separately
            }

            // Regular expression to validate only numbers, allowing up to two decimal places
            const regex = /^[-+]?[0-9]*\.?[0-9]{0,2}$/;
            const valid = regex.test(value);

            // Return validation result
            return valid ? null : { 'numeric': true };
        }
    }
}
