import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filtersSubject: BehaviorSubject<{ [key: string]: boolean }> = new BehaviorSubject<{ [key: string]: boolean }>({});
  filters$: Observable<{ [key: string]: boolean }> = this.filtersSubject.asObservable();

  setFilters(filters: { [key: string]: boolean }) {
    this.filtersSubject.next(filters);
  }
}
