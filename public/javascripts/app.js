import '../sass/style.scss';
import { $, $$ } from './modules/bling';
import autocomplete from "./modules/autocomplete";
import typeAhead from "./modules/typeahead";
import initMap, {nearMe} from "./modules/map";
import ajaxHeart from "./modules/heart";

autocomplete( $('#search'),  $('#name'),  $('#address'),  $('#lat'),  $('#lng') );

typeAhead($('.search'));

initMap($('#map'));

$('.near-me').on('click', nearMe);

const heartForms = $$('form.heart');
heartForms.on('submit', ajaxHeart);