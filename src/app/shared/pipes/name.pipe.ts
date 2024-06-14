import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe que transforma un nombre, capitalizando la primera letra y truncando el texto si excede el límite especificado.
 */
@Pipe({
  name: 'name'
})
export class NamePipe implements PipeTransform {

  /**
   * Transforma un nombre, capitalizando la primera letra y truncando el texto si excede el límite especificado.
   * 
   * @param name El nombre a transformar.
   * @param limit El límite de caracteres para truncar el nombre.
   * @returns El nombre transformado, capitalizado y truncado si es necesario.
   */
  transform(name: string | undefined, limit: number): string {
    // Verifica si el nombre es válido
    if (name) {
      // Capitaliza la primera letra del nombre
      let firstLetterCapital = name.charAt(0).toUpperCase() + name.slice(1);

      // Verifica si el nombre capitalizado excede el límite
      if (firstLetterCapital.length > limit) {
        // Trunca el nombre y añade "..." al final
        return firstLetterCapital.substring(0, limit) + '... ';
      } else {
        // Devuelve el nombre completo si no excede el límite
        return firstLetterCapital;
      }
    } else {
      // Si el nombre es undefined o vacío, devuelve una cadena vacía
      return "";
    }
  }
}
