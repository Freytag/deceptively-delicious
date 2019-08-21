import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(stores) {
  return stores.map(store => {
    return `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `;
  }).join('');
}

function typeAhead(search) {
  if(!search) return;
  const searchInput = search.querySelector('.search__input');
  const searchResults = search.querySelector('.search__results');
  searchInput.on('input', function(){
    if (!this.value) {
      searchResults.style.display = 'none';
      return;
    }

    //show the results
    searchResults.style.display = 'block';

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
          return;
        }
        // no results
        searchResults.innerHTML = dompurify.sanitize(`
        <div class="search__result">No <strong>${this.value}</strong> places found.</div>`);
      })
      .catch(err => {
        console.error(err);
      });
  })

  //handle keyboard inputs
  searchInput.on('keyup', (e) => {
    if (![38,40,13].includes(e.keyCode)) return;

    const keyPressed = e.keyCode;

    const activeClass = 'search__result--active',
          current     = search.querySelector(`.${activeClass}`),
          items       = search.querySelectorAll('.search__result');

    let next;

    if (keyPressed === 40 && current) {
      next = current.nextElementSibling || items[0];
    }
    else if(keyPressed === 40) {
      next = items[0];
    }
    else if (keyPressed === 38 && current) {
      next = current.previousElementSibling || items[items.length -1];
    }
    else if(keyPressed === 38) {
      next = items[0];
    }
    else if(keyPressed === 13 && current.href) {
      window.location = current.href;
    }

    if (current) {
      current.classList.remove(activeClass)
    }
    next.classList.add(activeClass);

  })
}

export default typeAhead;