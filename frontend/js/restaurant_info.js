let restaurant;
var map;

document.addEventListener('DOMContentLoaded', (event) => {
  fetchRestaurantFromURL((error, restaurant)=>{
    if (error) { // Got an error!
      console.error(error);
    } else {
      setLazyLoadMap();
    }
  });
});
/**
 * Initialize Google map, called from HTML.
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

let setLazyLoadMap = () => {
  let lazyMap = document.getElementById('map');

  if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) {
    lazyMapObserver.observe(lazyMap);
  }  else {
    console.log('~~~~~~~~~~~~~~~~~ no IntersectionObserver ~~~~~~~~~~~~~~~~~');
    return;
  }
}

let lazyMapObserver = new IntersectionObserver( entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
    let lazyMap = entry.target;
    var mapsJS = document.createElement('script');
    mapsJS.src = 'https://maps.googleapis.com/maps/api/js?callback=initMap&key=AIzaSyDEwOJQAdsxaQFqXkFTvxAWQaOkF_j4Lo8';
    document.getElementsByTagName('head')[0].appendChild(mapsJS)
    lazyMapObserver.unobserve(lazyMap);
  }
  })
});

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      setLazyLoadImage();
      fillMetaDesc();
      callback(null, restaurant)
    });
  }
}

/**
 * Add meta description to page
 */
fillMetaDesc = (restaurant = self.restaurant) => {
  document.querySelector('meta[name=description]').setAttribute("content",restaurant.name);
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.setAttribute('aria-label','restaurant name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.setAttribute('aria-label','restaurant address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  const defaultImage = DBHelper.imageUrlForRestaurant(restaurant);
  const withoutExtensions = defaultImage.replace(/\.[^/.]+$/, '');
  image.alt = `${restaurant.name} profile photo`;
  image.dataset.src = `${withoutExtensions}.jpg`;
  image.dataset.srcset = `${withoutExtensions}_250.webp 250w, ${withoutExtensions}_150.webp 150w`;
  image.classList.add('lazy-img');

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.setAttribute('aria-label','cuisine type');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

let setLazyLoadImage = () => {
  let lazyImages = [].slice.call(document.querySelectorAll('img.lazy-img'));

  if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) {
    lazyImages.forEach(lazyImage => lazyImageObserver.observe(lazyImage));
  }  else {
    console.log('~~~~~~~~~~~~~~~~~ no IntersectionObserver ~~~~~~~~~~~~~~~~~');
    return;
  }
}

let lazyImageObserver = new IntersectionObserver( entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      let lazyImage = entry.target;
      lazyImage.src = lazyImage.dataset.src;
      // lazyImage.srcset = lazyImage.dataset.srcset;
      lazyImage.classList.remove('lazy-img');
      lazyImageObserver.unobserve(lazyImage);
    }
  });
});

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('th');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}



/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = () => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  title.setAttribute('id','reviews-header');
  container.appendChild(title);

  const id = getParameterByName('id');
  DBReviews.fetchReviewsByRestaurant(id, (error, reviews) => {
    self.reviews = reviews;
    if (!reviews) {
      const noReviews = document.createElement('p');
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      return;
    }
    reviews.forEach(review => {
      ul.appendChild(createReviewHTML(review));
    });
  });
  const ul = document.getElementById('reviews-list');

  container.appendChild(ul);
}

let createImg = (restaurant) => {
  const image = document.createElement('img');
  image.className = 'restaurant-img lazy-img';
  image.alt = `${restaurant.name} profile photo`;

  const defaultImage = DBHelper.imageUrlForRestaurant(restaurant);
  if (defaultImage) {
    const withoutExtensions = defaultImage.replace(/\.[^/.]+$/, '');
    image.dataset.src = `${withoutExtensions}.jpg`;
    image.dataset.srcset = `${withoutExtensions}_250.webp 250w, ${withoutExtensions}_150.webp 150w`;
    image.classList.add('lazy-img');
  }
  return image;
}


/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.setAttribute('tabindex','0');
  
  const art = document.createElement('article');
  art.setAttribute('role','article');
  art.setAttribute('aria-label','review by '+review.name);
  li.append(art);

  const rev = document.createElement('div');
  rev.className = 'review-title';
  art.appendChild(rev);

  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.className = 'reviewer';
  art.setAttribute('aria-label','reviewer');
  rev.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  date.className = 'reviewDate';
  date.setAttribute('aria-label','review date');
  rev.appendChild(date);

  const ratingDiv = document.createElement('div');
  ratingDiv.className = 'rating';
  art.appendChild(ratingDiv);

  const rating = document.createElement('p');
  rating.className = 'ratings';
  rating.setAttribute('aria-label','rating');
  rating.innerHTML = `Rating: ${review.rating}`;
  ratingDiv.appendChild(rating);

  const comments = document.createElement('p');
  comments.className = 'comments';
  comments.innerHTML = review.comments;
  comments.setAttribute('aria-label','comment');
  art.appendChild(comments);

  return li;
}


/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  const link = document.createElement('a');
  link.setAttribute('aria-current','page');
  link.href = '#';
  link.innerHTML = restaurant.name;
  li.append(link);
  // li.innerHTML = '<a href="#" aria-current="page">'+restaurant.name+'</a>';
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
