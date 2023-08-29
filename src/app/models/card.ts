export class Card {
    constructor(
        public _id: string,
        public name: string,
        public type: string,
        public expansion: string,
        public price: number,
        public language: string,
        public img: string,
        public desc: string,
        public stock: number
    ) { }

}
