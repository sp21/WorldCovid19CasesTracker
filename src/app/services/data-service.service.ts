import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { DateWiseData } from '../models/date-wise-data';
import { GlobalDataSummary } from '../models/global-data';
@Injectable({
  providedIn: 'root'
})
export class DataServiceService {

  getingDateString(): string {
    const today = new Date();
    const yesterday = new Date(today);

    yesterday.setDate(yesterday.getDate() - 1)

    today.toDateString();
    yesterday.toDateString();
    let tempYesterdatDate = yesterday.getDate();
    let tempYesterdayMonth = yesterday.getMonth()+1;
    let tempYesterdayYear = yesterday.getFullYear();
    let exactYesterdayDate: string;
    let exactYesterdayMonth: string;
    let exactYesterdayYear: string;
    if (tempYesterdatDate <= 9) {
      exactYesterdayDate = ('0' + tempYesterdatDate).toString();
    } else {
      exactYesterdayDate = tempYesterdatDate.toString();
    }
    if (tempYesterdayMonth <= 9) {
      exactYesterdayMonth = ('0' + tempYesterdayMonth).toString();
    } else {
      exactYesterdayMonth = tempYesterdayMonth.toString();
    }
    if (tempYesterdayYear <= 9) {
      exactYesterdayYear = ('0' + tempYesterdayYear).toString();
    } else {
      exactYesterdayYear = tempYesterdayYear.toString();
    }
    let fullYesterdayDate=exactYesterdayMonth + "-" + exactYesterdayDate + "-" + exactYesterdayYear;
    console.log(fullYesterdayDate)
    return fullYesterdayDate;
  }
  // gettingDate(): string {
  //   var tempDate = new Date().getDate() - 1;

  //   var exactDate: string;

  //   if (tempDate <= 9) {
  //     exactDate = ('0' + tempDate).toString();
  //   } else {
  //     exactDate = tempDate.toString();
  //   }
  //   return exactDate;
  // }
  private dateWiseDataUrl = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv`
  private globalDataUrl = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/"+this.getingDateString()+".csv";
 
  constructor(private http: HttpClient) { }
  getDateWiseData() {
    return this.http.get(this.dateWiseDataUrl, { responseType: 'text' })
      .pipe(map(result => {
        let rows = result.split('\n');
        // console.log(rows);
        let mainData = {};
        let header = rows[0];
        let dates = header.split(/,(?=\S)/)
        dates.splice(0, 4);
        rows.splice(0, 1);
        rows.forEach(row => {
          let cols = row.split(/,(?=\S)/)
          let con = cols[1];
          cols.splice(0, 4);
          // console.log(con , cols);
          mainData[con] = [];
          cols.forEach((value, index) => {
            let dw: DateWiseData = {
              cases: +value,
              country: con,
              date: new Date(Date.parse(dates[index]))

            }
            mainData[con].push(dw)
          })

        })


        // console.log(mainData);
        return mainData;
      }))
  }
  getGlobalData() {
    return this.http.get(this.globalDataUrl, { responseType: 'text' }).pipe(
      map(result => {
        let data: GlobalDataSummary[] = [];
        let raw = {}
        let rows = result.split('\n');

        rows.splice(0, 1);
        //  console.log(rows);
        rows.forEach(row => {
          let cols = row.split(/,(?=\S)/)
          // console.log(cols)
          let cs = {
            country: cols[3],
            confirmed: +cols[7],
            deaths: +cols[8],
            recovered: +cols[9],
            active: +cols[10]
          };
          let temp: GlobalDataSummary = raw[cs.country];
          if (temp) {
            temp.active = cs.active + temp.active;
            temp.confirmed = cs.confirmed + temp.confirmed;
            temp.deaths = cs.deaths + temp.deaths;
            temp.recovered = cs.recovered + temp.recovered;
            raw[cs.country] = temp;
          } else {
            raw[cs.country] = cs;
          }
        })
        return <GlobalDataSummary[]>Object.values(raw);
      })
    )

  }
}
