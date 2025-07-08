//Everything else routes!

const express = require('express')
const router = express.Router()
const {createproduct,products,product,updateproduct,deleteproduct}= require('../controllers/product.js')
const protect = require('../middleware/protect.js')
const {declineOffer,acceptOffer,createOffer,orders,order,updateOrder,deleteOrder}= require('../controllers/order.js')
const {getMe,profile,updateProfile}= require('../controllers/profile.js')




//product stuff
router.post('/createproduct',protect,createproduct)
router.get('/products',protect,products)
router.get('/product/:id',protect,product)
router.put('/updateproduct/:id',protect,updateproduct)
router.delete('/deleteproduct/:id',protect,deleteproduct)



//order stuff

router.post('/order',protect,createOffer)
router.get('/orders',protect,orders)
router.get('/order/:id',protect,order)
router.put('/updateorder/:id',protect,updateOrder)
router.delete('/deleteorder/:id',protect,deleteOrder)
router.put('/acceptoffer/:id',protect,acceptOffer)
router.put('/declineoffer/:id',protect,declineOffer)

//profile stuff

router.get('/getMe',protect,getMe)
router.get('/profile/:id',protect,profile)
router.put('/updateprofile',protect,updateProfile)






module.exports=router;