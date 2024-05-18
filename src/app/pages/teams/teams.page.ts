import { Component, OnInit } from '@angular/core';
import { Haptics } from '@capacitor/haptics';
import { ModalController, ToastController, ToastOptions } from '@ionic/angular';
import { Team } from 'src/app/core/interfaces/team';
import { TeamService } from 'src/app/core/services/api/team.service';
import { TeamDetailComponent } from 'src/app/shared/components/team-detail/team-detail.component';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.page.html',
  styleUrls: ['./teams.page.scss'],
})
export class TeamsPage implements OnInit {

  public loading:boolean = false;

  
  constructor(
    public teams:TeamService,
    private toast:ToastController,
    private modal:ModalController
  ) { }

  ngOnInit() {
    this.loading = false;
    /*this.teams.getAll().subscribe(results=>{
      this.loading = false;
    });*/
  }

  onNewteam() {

    var onDismiss = (info:any)=>{
      switch(info.role){
        case 'ok':{
          this.teams.addTeam(info.data).subscribe(async player=>{
              const options:ToastOptions = {
              message:"Team created",
              duration:1000,
              position:'bottom',
              color:'tertiary',
              cssClass:'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification()
            //this.teams.getAll().subscribe();
          })
        }
        break;
        default:{
          console.error("No debería entrar");
        }
      }
    }
    this.presentForm(null, onDismiss);
  }

  public async onCardClicked(team:Team){
    
    var onDismiss = (info:any)=>{
      switch(info.role){
        case 'ok':{
          this.teams.updateTeam(info.data).subscribe(async team=>{
              const options:ToastOptions = {
              message:"Team modified",
              duration:1000,
              position:'bottom',
              color:'tertiary',
              cssClass:'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification()
           //this.teams.getAll().subscribe();
          })
        }
        break;
        case 'delete':{
          this.teams.deleteTeam(info.data).subscribe(async team=>{
            const options:ToastOptions = {
            message:"Team deleted",
            duration:1000,
            position:'bottom',
            color:'tertiary',
            cssClass:'card-ion-toast'
          };
          const toast = await this.toast.create(options);
          toast.present();
          await Haptics.notification()
          //this.teams.getAll().subscribe();
        })
        }
        break;
        default:{
          console.error("No debería entrar");
        }
      }
      //this.teams.getAll().subscribe();
    }
    this.presentForm(team, onDismiss);
  }


  public onDeleteClicked(team:Team){
    var _team:Team = {...team};

    this.teams.deleteTeam(_team).subscribe(
        {next: async team=>{
        const options:ToastOptions = {
          message:`Team deleted`,
          duration:1000,
          position:'bottom',
          color:'danger',
          cssClass:'fav-ion-toast'
        };
        //creamos el toast
        this.toast.create(options).then(toast=>toast.present());
        await Haptics.notification();
       // this.teams.getAll().subscribe();
      },
        error: err=>{
          console.log(err);
        }
      });
  }

  async presentForm(data:any|null, onDismiss:(result:any)=>void){
    
    const modal = await this.modal.create({
      component:TeamDetailComponent,
      componentProps:{
        team:data
      },
      cssClass:"fullModal"
    });
    modal.present();
    modal.onDidDismiss().then(result=>{
      if(result && result.data){
        onDismiss(result);
      }
    });
  }
}
