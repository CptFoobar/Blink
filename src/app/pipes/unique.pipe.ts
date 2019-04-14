import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unique'
})
export class UniquePipe implements PipeTransform {

  transform(value: any, filterOn?: string): any {

    if (!filterOn) {
      return value;
    }

    if (value instanceof Array) {
      value = value as Array<any>;
      let hashCheck = {};
      let newItems = [];

      let extractValueToCompare = function (item) {
        if (item instanceof Object) {
          return item[filterOn];
        } else {
          return item;
        }
      };

      value.forEach(item => {
        let valueToCheck;
        let isDuplicate = false;

        for (var i = 0; i < newItems.length; i++) {
          if (extractValueToCompare(newItems[i]) === extractValueToCompare(item)) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          newItems.push(item);
        }
      });
      value = newItems;
    }

    return value;
  }

}
