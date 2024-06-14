import { Injectable } from "@angular/core";
import { PaginatedData } from "../../interfaces/data";
import { User } from "../../interfaces/user";

/**
 * This abstract service handles URL construction and data mapping for user-related operations. It should be extended by other services to implement specific mapping logic.
 */
@Injectable({
  providedIn: 'root'
})
export abstract class MappingService {

  /**
   * Returns the URL to query for users.
   * 
   * @returns The URL string.
   */
  public abstract queryUsersUrl(): string;

  /**
   * Returns the URL to get a specific user by ID.
   * 
   * @param id The ID of the user.
   * @returns The URL string.
   */
  public abstract getUserUrl(id: number): string;

  /**
   * Returns the URL to update a specific user by ID.
   * 
   * @param id The ID of the user.
   * @returns The URL string.
   */
  public abstract updateUserUrl(id: number): string;

  /**
   * Returns the URL to delete a specific user by ID.
   * 
   * @param id The ID of the user.
   * @returns The URL string.
   */
  public abstract deleteUserUrl(id: number): string;

  /**
   * Maps paginated data to a list of users.
   * 
   * @param data The paginated data from the backend.
   * @returns The paginated data mapped to the User interface.
   */
  public abstract mapUsers(data: PaginatedData<any>): PaginatedData<User>;

  /**
   * Maps backend data to a single user.
   * 
   * @param data The data from the backend.
   * @returns The data mapped to the User interface.
   */
  public abstract mapUser(data: any): User;
}
