import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take, map, delay, tap } from 'rxjs/operators';

import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  // private _places: Place[] = [
  //   new Place(
  //     'p1',
  //     'Manhattan Mansion',
  //     'In the heart of New York City.',
  //     'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
  //     149.99,
  //     new Date('2019-01-01'),
  //     new Date('2019-12-31'),
  //     'abc'
  //   ),
  //   new Place(
  //     'p2',
  //     'L\'Amour Toujours',
  //     'A romantic place in Paris!',
  //     'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Paris_Night.jpg/1024px-Paris_Night.jpg',
  //     189.99,
  //     new Date('2019-01-01'),
  //     new Date('2019-12-31'),
  //     'abc'
  //   ),
  //   new Place(
  //     'p3',
  //     'The Foggy Palace',
  //     'Not your average city trip!',
  //     'https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg',
  //     99.99,
  //     new Date('2019-01-01'),
  //     new Date('2019-12-31'),
  //     'abc'
  //   )
  // ];

  // Das ist ein BehaviorSubject of Places das mit Default Werten startet
  private _places = new BehaviorSubject<Place[]>([
    new Place(
      'p1',
      'Manhattan Mansion',
      'In the heart of New York City.',
      'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
      149.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'abc'
    ),
    new Place(
      'p2',
      "L'Amour Toujours",
      'A romantic place in Paris!',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Paris_Night.jpg/1024px-Paris_Night.jpg',
      189.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'abc'
    ),
    new Place(
      'p3',
      'The Foggy Palace',
      'Not your average city trip!',
      'https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg',
      99.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'abc'
    )
  ]);

  // Getter liefert eine Kopie von places
  // get places() {
  //   console.log('getter');
  //   return [...this._places];
  // }

  /* _places ist jetzt ein Subject und gibt daher jetzt ein Observable zurück,
     infolge kann der getter subscribt werden!
  */
  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService) { }

  // getPlace(id: string) {
  //   return {...this._places.find(p => p.id === id)};
  // }

  getPlace(id: string) {
    /* Ich möchte meine neueste Liste und ich kann das mit der pipe-Methode und
       dem Operator take(1) machen
       map ist ein zweiter Operator
       map nimmt jetzt die Liste was take liefert
       die Liste ist ja ein Array of Places
       Ich möchte aber genau das Objekt mit der übergebenen id
       WICHTIG:
       map wrapt das Ergbnis automatisch in ein Observable!
       Somit kann getPlace subscribt werden
    */
    return this.places
    .pipe(
      take(1),
      map(places => {
        return { ...places.find(p => p.id === id) };
      })
    );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );

    // Alte Variante
    /* this.places kann subscribt werden
       ich möchte aber nicht alle feature updates zurück haben, sondern nur das 
       aktuelle Array von Places!
       Dafür gibt es in rxjs Operatoren!
       Der benötigte Operator lautet take().
       Für die Nutzung eine Operators benötigen wir die pipe().
       Die pipe() gibt es bei allen Observable-Typen
       take(1) nimmt das subscribe Objekt und liefert nur das letzte Object aus der Liste
       concat ist eine JavaScript Array-Methode
       places ist ein Array mit allen bisherigen Places (also das places vor => {this._places.next(... 
       places.concat steckt das neue Place Object rein und liefert das neue Array von Places zurück
       .netx löst alle subscriber aus
        - den in der Übersicht
        - und diesen hier AUCH! Das würde hier zu einer Endlosschleife führen!
          deswegen MUSS mit pipe und take 1 gearbeitet werden!
    */
    // this.places.pipe(take(1)).subscribe(places => {

    //   // console.log('places.concat(newPlace)');
    //   // console.log(places.concat(newPlace));
    //   this._places.next(places.concat(newPlace));
    // });

    // Neue Variante
    /* tap empfängt die places genau so wie zuvor OBEN subscribe
       subscribe beendet das Observable
       tab erhält das Observable am Leben damit addPlaces ein Observable returnen kann
       addPlaces kann jetzt in der UI subscribt werden!
       delay() verzögert um 1 Sekunde
    */
    return this.places.pipe(
      take(1),
      delay(1000),
      tap(places => {
        this._places.next(places.concat(newPlace));
      })
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    return this.places.pipe(
      take(1),
      delay(1000),
      tap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        const updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );

        console.log(this._places);

        /* ACHTUNG!
           Erst next updatet das _places Observable
        */
        this._places.next(updatedPlaces);
      })
    );
  }
}
