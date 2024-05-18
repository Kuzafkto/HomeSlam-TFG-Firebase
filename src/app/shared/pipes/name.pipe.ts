// capitalize-truncate.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'name'
})
export class NamePipe implements PipeTransform {
  transform(name: string|undefined,limit:number): string {
    if (name) {
    let firstLetterCapital = name.charAt(0).toUpperCase() + name.slice(1);

    if(firstLetterCapital.length>limit){
      return firstLetterCapital.substring(0, limit) + '... '
    }else{
      return firstLetterCapital
    }
    
    }else{
      return ""
    }
  }
}
