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
    return `http://localhost:${port}/reviews/`;
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
          // DBReviews.fetchReviewsByRestaurant(data.restaurant_id,(error, restaurant) => {
          //   self.restaurant = restaurant;
          //   console.log('restaurant: ' + restaurant);
          // })
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
  }

  /**
   * Fetch reviews by restaurant.
   */
  static fetchReviewsByRestaurant(id, callback) {
    // fetch all reviews from a restaurant with proper error handling.
    DBReviews.fetchReviews((error, reviews) => {
      console.log(reviews);
      if (error) {
        callback(error, null);
      } else {
        const reviewList = reviews.filter(r => r.restaurant_id == id);
        if(reviewList) {
          callback(null, reviewList);
        } else {
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Submit reviews.
   */
  static submitReviews(reviewData) {
    return fetch(DBReviews.DATABASE_URL, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      referrer: 'no-referrer',
      credentials: 'same-origin',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(reviewData)
    })
    .then(response => {
      response.json()
        .then( data => {
          var dbPromise = DBReviews.openDB();
          dbPromise.onsuccess = () => {
            // Start a new DB transaction
            var db = dbPromise.result;
            var tx = db.transaction("ReviewsObjectStore", "readwrite");
            var store = tx.objectStore("ReviewsObjectStore");

            store.put(data);

            // Close the db when the transaction is done
            tx.oncomplete = event => {
                db.close();
            };
          }
        })
    })
    .catch( error => console.log('Something went wrong with the submission. Error: ' + error))
  }
}