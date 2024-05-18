import { Directive, ElementRef, Renderer2, OnInit, Input } from '@angular/core';
import { ApiService } from 'src/app/core/services/api/api.service';

@Directive({
  selector: '[positionImage]'
})
export class PositionImageDirective implements OnInit {
  private position = -1;
  @Input() set positionName(pos: number) {
    this.position = pos
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private api: ApiService
  ) { }

  ngOnInit() {
    // Seleccionar un nombre de imagen aleatorio de la matriz
    let positionUrl = "";
    // Realizar una llamada HTTP para obtener la imagen aleatoria
    switch (this.position) {
      case 2:
        positionUrl = "https://firebasestorage.googleapis.com/v0/b/home-slam.appspot.com/o/catcher%20logo.png?alt=media&token=bd536903-378b-46e9-8e91-b2a784a93f06";
        break;
      case 1:
        positionUrl="https://firebasestorage.googleapis.com/v0/b/home-slam.appspot.com/o/noun-baseball-pitcher-2745168.png?alt=media&token=5817cc45-2618-4384-bd11-00e61b678775";
        break;
      case 3:
        positionUrl="https://firebasestorage.googleapis.com/v0/b/home-slam.appspot.com/o/noun-mitt-1941039.png?alt=media&token=587d6ce6-3d13-4440-b2a4-da79454a87bd";
        break;
      case 4:
        positionUrl="https://firebasestorage.googleapis.com/v0/b/home-slam.appspot.com/o/noun-home-base-5005428.png?alt=media&token=4f387627-60f7-42d6-868d-778a81145809";
        break;
      case 5:
        positionUrl="https://firebasestorage.googleapis.com/v0/b/home-slam.appspot.com/o/noun-home-base-5005447.png?alt=media&token=3f4eb468-46ef-408b-9a6c-2e62b27f79e7";
        break;
      case 6:
        positionUrl="https://firebasestorage.googleapis.com/v0/b/home-slam.appspot.com/o/shortstop.png?alt=media&token=f05da330-2c20-461b-83bf-b5d1783201c2";
        break;
      case 7:
        positionUrl="https://firebasestorage.googleapis.com/v0/b/home-slam.appspot.com/o/noun-baseball-player-54549.png?alt=media&token=c39eff19-4e52-4379-857d-ba2f2549812e";
        break;
      case 8:
        positionUrl="https://firebasestorage.googleapis.com/v0/b/home-slam.appspot.com/o/noun-catcher-643797.png?alt=media&token=485f3826-d24a-479a-94e1-97ed7c211bdd";
        break;
      case 9:
        positionUrl="https://firebasestorage.googleapis.com/v0/b/home-slam.appspot.com/o/rightfield.png?alt=media&token=68854fa0-b8ef-439f-983d-486238a92c6c";
        break;
      case 10:
        positionUrl="https://firebasestorage.googleapis.com/v0/b/home-slam.appspot.com/o/unknown.png?alt=media&token=756b782e-9cdc-40ad-ae01-13ae9677ce28";
        break;
        default:
          positionUrl="https://firebasestorage.googleapis.com/v0/b/home-slam.appspot.com/o/unknown.png?alt=media&token=756b782e-9cdc-40ad-ae01-13ae9677ce28";
        break;
    }
    this.applyBackgroundImage(positionUrl);
  }

  private applyBackgroundImage(url: string): void {
    // Aplicar la URL de imagen al fondo del elemento
    this.renderer.setStyle(this.el.nativeElement, 'background-image', `url(${url})`);
    this.renderer.setStyle(this.el.nativeElement, 'background-size', 'cover');
    this.renderer.setStyle(this.el.nativeElement, 'background-repeat', 'no-repeat');
    this.renderer.setStyle(this.el.nativeElement, 'width', '70px');
    this.renderer.setStyle(this.el.nativeElement, 'height', '70px');
    this.renderer.setStyle(this.el.nativeElement, 'border-radius', '50%');
  }


}

