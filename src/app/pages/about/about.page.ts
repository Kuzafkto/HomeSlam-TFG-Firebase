import { Component, OnInit } from '@angular/core';
import { HttpClientProvider } from 'src/app/core/services/http/http-client.provider';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {

  constructor(
    private http:HttpClientProvider,
  ) { }
userUrl="";
  ngOnInit() {
   this.http.get("https://api.github.com/search/users?q=Kuzafkto+in%3Ausername",null,null).subscribe((result:any)=>{
    this.userUrl=result.items[0].avatar_url;
   });
  }
  openLink(link:string){
    window.open(link,'_blank')
  }
}
