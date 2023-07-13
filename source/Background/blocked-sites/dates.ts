export class Dates {
  public static minutesToMilliseconds(minutes: number): number {
    return minutes * 60000;
  }

  public static getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm: number | string = today.getMonth() + 1;
    let dd: number | string = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    return dd + '-' + mm + '-' + yyyy;
  }
}
