const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(storeController.getStores) );

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug) );

router.get('/stores', catchErrors(storeController.getStores) );

router.get('/stores/:id/edit', catchErrors(storeController.editStore) );

router.get('/add',
  authController.isLoggedIn,
  storeController.addStore
);

router.post('/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);

router.post('/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

router.get('/tags', catchErrors(storeController.getStoreByTag) );

router.get('/tags/:tag', catchErrors(storeController.getStoreByTag) );

router.get('/login', userController.loginForm);

router.post('/login', authController.login);

router.get('/register', userController.registerForm);

// 1. Validate the registration data
// 2. Register the user
// 3. Login in on Success
router.post('/register',
  userController.validateRegister,
  catchErrors(userController.register),
  authController.login
);

router.get('/logout', authController.logout);

router.get('/account',
  authController.isLoggedIn,
  userController.account
);

router.post('/account', catchErrors(userController.updateAccount));

// 1. check if the email is registered.
// 2. set token for the user
// 3. set expiration for token
// 4. save user
// 5. email token for password reset
router.post('/account/forgot', catchErrors(authController.forgot))

router.get('/account/reset/:token', catchErrors(authController.reset))

router.post('/account/reset/:token',
  catchErrors(authController.confirmPassword),
  catchErrors(authController.update)
);

router.get('/map', storeController.showMap);


// router.get('/api/v1/search')
// router.get('/api/v2/search')
router.get('/api/search', catchErrors(storeController.searchStores))

router.get('/api/stores/near', catchErrors(storeController.mapStores));



module.exports = router;
