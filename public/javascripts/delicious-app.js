import '../sass/style.scss';
import { $, $$ } from './modules/bling';
import autocomplete from "./modules/autocomplete";

autocomplete( $('#search'),  $('#name'),  $('#address'),  $('#lat'),  $('#lng') );

console.info('hello');
