import { Component, OnInit } from '@angular/core';
import { HttpClientProvider } from 'src/app/core/services/http/http-client.provider';

/**
 * Component for displaying information about the user.
 */
@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {

  /**
   * URL of the user's avatar.
   */
  userUrl = "";

  /**
   * Constructor for AboutPage component.
   *
   * @param http Injected HttpClientProvider service for making HTTP requests.
   */
  constructor(private http: HttpClientProvider) { }

  /**
   * Angular lifecycle hook that runs after the component's view has been initialized.
   * Here we make an HTTP GET request to fetch user data from GitHub API.
   */
  ngOnInit() {
    // Fetch user data from GitHub API
    this.http.get("https://api.github.com/search/users?q=Kuzafkto+in%3Ausername", null, null)
      .subscribe((result: any) => {
        // Set the URL of the user's avatar
        this.userUrl = result.items[0].avatar_url;
      });
  }

  /**
   * Opens a link in a new browser tab.
   *
   * @param link The URL to open.
   */
  openLink(link: string) {
    window.open(link, '_blank');
  }
}
