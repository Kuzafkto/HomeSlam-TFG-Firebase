import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Haptics } from '@capacitor/haptics';
import { ModalController, ToastController, ToastOptions } from '@ionic/angular';
import { Player } from 'src/app/core/interfaces/player';
import { AuthService } from 'src/app/core/services/api/auth.service';
import { PlayersService } from 'src/app/core/services/api/player.service';
import { PlayerDetailComponent } from 'src/app/shared/components/player-detail/player-detail.component';

@Component({
  selector: 'app-players',
  templateUrl: './players.page.html',
  styleUrls: ['./players.page.scss'],
})
export class PlayersPage implements OnInit {
 
  public loading:boolean = false;
  constructor(
    private router:Router,
    private toast:ToastController,
    public players:PlayersService,
    private modal:ModalController,
  ) {
  }

  ngOnInit(): void {
    this.loading = true;
   /* this.players.getAll().subscribe(results=>{
      this.loading = false;
    });*/
    this.loading = false;
  }


  

  public onDeleteClicked(player:Player){
    var _player:Player = {...player};

    this.players.deletePlayer(_player).subscribe(
        {next: async player=>{
        const options:ToastOptions = {
          message:`Player deleted`,
          duration:1000,
          position:'bottom',
          color:'danger',
          cssClass:'fav-ion-toast'
        };
        //creamos el toast
        this.toast.create(options).then(toast=>toast.present(),);
        await Haptics.notification();
        },
        error: err=>{
          console.log(err);
        }
      });
  }

  public async onCardClicked(player:Player){
    console.log("oncardClicked: "+player);
    var onDismiss = (info:any)=>{
      switch(info.role){
        case 'ok':{
          this.players.updatePlayer(info.data).subscribe(async player=>{
              const options:ToastOptions = {
              message:"Player modified",
              duration:1000,
              position:'bottom',
              color:'tertiary',
              cssClass:'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification()
          })
        }
        break;
        case 'delete':{
          this.players.deletePlayer(info.data).subscribe(async player=>{
            const options:ToastOptions = {
            message:"Player deleted",
            duration:1000,
            position:'bottom',
            color:'tertiary',
            cssClass:'card-ion-toast'
          };
          const toast = await this.toast.create(options);
          toast.present();
          await Haptics.notification()
        })
        }
        break;
        default:{
          console.error("No debería entrar");
        }
      }
     // this.players.getAll().subscribe();

    }
    this.presentForm(player, onDismiss);
  }

  
  async presentForm(data:Player|null, onDismiss:(result:any)=>void){
    
    const modal = await this.modal.create({
      component:PlayerDetailComponent,
      componentProps:{
        player:data
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

  onNewplayer(){
    var onDismiss = (info:any)=>{
      console.log(info.data);
      switch(info.role){
        case 'ok':{
          console.log(info.data);
          this.players.addPlayer(info.data).subscribe(async player=>{
              const options:ToastOptions = {
              message:"Player created",
              duration:1000,
              position:'bottom',
              color:'tertiary',
              cssClass:'card-ion-toast'
            };
            const toast = await this.toast.create(options);
            toast.present();
            await Haptics.notification();
           // this.players.getAll().subscribe();
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
  
 

}
