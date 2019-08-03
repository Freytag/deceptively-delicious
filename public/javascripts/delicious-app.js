import '../sass/style.scss';
import { $, $$ } from './modules/bling';
import autocomplete from "./modules/autocomplete";
import typeAhead from "./modules/typeahead";
import initMap from "./modules/map";
import ajaxHeart from "./modules/heart";

autocomplete( $('#search'),  $('#name'),  $('#address'),  $('#lat'),  $('#lng') );

typeAhead($('.search'));

initMap($('#map'));

const heartForms = $$('form.heart');
heartForms.on('submit', ajaxHeart);