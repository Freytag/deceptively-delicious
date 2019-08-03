import axios from 'axios';
import { $ } from './bling';

function ajaxHeart(e) {
  e.preventDefault();
  axios
    .post(this.action)
    .then(res => {
      // this is our Form and it allows us to access elements by their name property
      const isHearted = this.heart.classList.toggle('heart__button--hearted');
      if (isHearted) {
        this.heart.classList.add('heart__button--float');
        setTimeout(() => {
          this.heart.classList.remove('heart__button--float');
        }, 2500)

      }
      $('heart-counted').textContent = res.data.hearts.length;
    })
    .catch()
}

export default ajaxHeart;