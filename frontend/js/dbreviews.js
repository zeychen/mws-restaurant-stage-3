/**
 * Reviews database helper functions.
 */
if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}

class DBReviews {

  /**
   * Database URL.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews`;
  }

  /**
   * Create IDB
   **/

  static openDB(dbOpen){
    // Makes sure indexedDB works across different browsers
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
  
    // Open (or create) restaurant database
    return indexedDB.open("reviewsDB", 1);
  }

  static createDB(reviews) {
    var dbPromise = DBReviews.openDB();

    dbPromise.onupgradeneeded = () => {
      var db = dbPromise.result;
      var store = db.createObjectStore("ReviewsObjectStore", {keyPath: "id"});
      var index = store.createIndex("by-id", "id");
    }

    dbPromise.onerror = () => {
      console.log("could not create indexedDB");
    }

    dbPromise.onsuccess = () => {
      // Start a new DB transaction
      var db = dbPromise.result;
      var tx = db.transaction("ReviewsObjectStore", "readwrite");
      var store = tx.objectStore("ReviewsObjectStore");

      // Store reviews in DB
      reviews.forEach(review => {
        store.put(review);
      });

      // Close the db when the transaction is done
      tx.oncomplete = event => {
          db.close();
      };
    }
  }
  
  static getCachedData(callback){
    // Start a new DB transaction
    var dbPromise = DBHelper.openDB();
    dbPromise.onsuccess = function() {
      var db = dbPromise.result;
      var tx = db.transaction("ReviewsObjectStore", "readwrite");
      var store = tx.objectStore("ReviewsObjectStore");

      // get cached reviews from DB
      var cached = store.getAll();

      cached.onsuccess = () => {
        callback(null, cached.result);
      }

      // Close the db when the transaction is done
      tx.oncomplete = function() {
          db.close();
      };
    }
  }

  /**
   * Fetch all reviews.
   */
  static fetchReviews(callback) {
    fetch(DBReviews.DATABASE_URL)
      .then(response => {
        if(response.status !== 200) {
          console.log('Failed to fetch reviews. Status code: ' + response.status);
          return;
        }
        response.json().then(data => {
          DBReviews.createDB(data);  // Cache reviews in IDB
          callback(null,data);
        })
      })
      .catch(error => {
        console.log('Failed to fetch reviews. Currently using cached data.');
        DBReviews.getCachedData((error, reviews) => {
          if(reviews.length > 0) {
            callback(null, reviews);
          }
        })
      })

    // let xhr = new XMLHttpRequest();

    // if(navigator.onLine) {
    //   xhr.open('GET', DBHelper.DATABASE_URL);
    
    //   xhr.onload = function() {
    //     if (xhr.status === 200) { // Got a success response from server!
    //       const restaurantsJSON = JSON.parse(xhr.responseText);
    //       DBHelper.createDB(restaurantsJSON); // Cache restaurant in IDB
    //       callback(null, restaurantsJSON);
    //     } else { // Oops!. Got an error from server.
    //       const error = (`Request failed. Returned status of ${xhr.status}`);
    //       callback(error, null);
    //     }
    //   };
    //   xhr.send();
    // } else {
    //   console.log("Unable to reach server. Currently using cached data.")
    //   DBHelper.getCachedData(function(error, restaurants){
    //     if(restaurants.length > 0){          
    //       callback(null, restaurants);
    //     }
    //   })
    // }
    
  }

//   /**
//    * Fetch a restaurant by its ID.
//    */
//   static fetchReviewsById(id, callback) {
//     // fetch all reviews from a restaurant with proper error handling.
//     DBReviews.fetchReviews((error, restaurants) => {
//       if (error) {
//         callback(error, null);
//       } else {
//         const restaurant = restaurants.find(r => r.id == id);
//         if (restaurant) { // Got the restaurant
//           callback(null, restaurant);
//         } else { // Restaurant does not exist in the database
//           callback('Restaurant does not exist', null);
//         }
//       }
//     });
//   }

//   /**
//    * Fetch restaurants by a cuisine type with proper error handling.
//    */
//   static fetchRestaurantByCuisine(cuisine, callback) {
//     // Fetch all restaurants  with proper error handling
//     DBHelper.fetchRestaurants((error, restaurants) => {
//       if (error) {
//         callback(error, null);
//       } else {
//         // Filter restaurants to have only given cuisine type
//         const results = restaurants.filter(r => r.cuisine_type == cuisine);
//         callback(null, results);
//       }
//     });
//   }

//   /**
//    * Fetch restaurants by a neighborhood with proper error handling.
//    */
//   static fetchRestaurantByNeighborhood(neighborhood, callback) {
//     // Fetch all restaurants
//     DBHelper.fetchRestaurants((error, restaurants) => {
//       if (error) {
//         callback(error, null);
//       } else {
//         // Filter restaurants to have only given neighborhood
//         const results = restaurants.filter(r => r.neighborhood == neighborhood);
//         callback(null, results);
//       }
//     });
//   }

//   /**
//    * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
//    */
//   static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
//     // Fetch all restaurants
//     DBHelper.fetchRestaurants((error, restaurants) => {
//       if (error) {
//         callback(error, null);
//       } else {
//         let results = restaurants
//         if (cuisine != 'all') { // filter by cuisine
//           results = results.filter(r => r.cuisine_type == cuisine);
//         }
//         if (neighborhood != 'all') { // filter by neighborhood
//           results = results.filter(r => r.neighborhood == neighborhood);
//         }
//         callback(null, results);
//       }
//     });
//   }

//   /**
//    * Fetch all neighborhoods with proper error handling.
//    */
//   static fetchNeighborhoods(callback) {
//     // Fetch all restaurants
//     DBHelper.fetchRestaurants((error, restaurants) => {
//       if (error) {
//         callback(error, null);
//       } else {
//         // Get all neighborhoods from all restaurants
//         const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
//         // Remove duplicates from neighborhoods
//         const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
//         callback(null, uniqueNeighborhoods);
//       }
//     });
//   }

//   /**
//    * Fetch all cuisines with proper error handling.
//    */
//   static fetchCuisines(callback) {
//     // Fetch all restaurants
//     DBHelper.fetchRestaurants((error, restaurants) => {
//       if (error) {
//         callback(error, null);
//       } else {
//         // Get all cuisines from all restaurants
//         const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
//         // Remove duplicates from cuisines
//         const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
//         callback(null, uniqueCuisines);
//       }
//     });
//   }

//   /**
//    * Restaurant page URL.
//    */
//   static urlForRestaurant(restaurant) {
//     return (`./restaurant.html?id=${restaurant.id}`);
//   }

//   /**
//    * Restaurant image URL.
//    */
//   static imageUrlForRestaurant(restaurant) {
//     return (`/img/${restaurant.id}.jpg`);
//   }

//   /**
//    * Map marker for a restaurant.
//    */
//   static mapMarkerForRestaurant(restaurant, map) {
//     const marker = new google.maps.Marker({
//       position: restaurant.latlng,
//       title: restaurant.name,
//       url: DBHelper.urlForRestaurant(restaurant),
//       map: map,
//       animation: google.maps.Animation.DROP}
//     );
//     return marker;
//   }

}
