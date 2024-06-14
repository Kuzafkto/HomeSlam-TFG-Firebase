/**
 * Interface representing the information required for user registration.
 */
export interface UserRegisterInfo {
    /**
     * The email of the user.
     */
    email: string;

    /**
     * The name of the user.
     */
    name: string;

    /**
     * The surname of the user.
     */
    surname: string;

    /**
     * The password of the user.
     */
    password: string;

    /**
     * The nickname of the user.
     */
    nickname: string;
}
