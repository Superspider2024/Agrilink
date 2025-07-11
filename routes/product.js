//Everything else routes!

const express = require('express')
const router = express.Router()
const {createproduct,products,product,updateproduct,deleteproduct}= require('../controllers/product.js')
const protect = require('../middleware/protect.js')
const {declineOffer,acceptOffer,createOffer,orders,order,updateOrder,deleteOrder,transport,offers}= require('../controllers/order.js')
const {getMe,profile,updateProfile,users}= require('../controllers/profile.js')
const { chatList,addChat,deleteChat } = require('../controllers/chat.js')




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
router.get('/offers',protect,offers)
router.post("/transport",protect,transport)

//profile stuff

router.get('/getMe',protect,getMe)
router.get('/profile/:id',protect,profile)
router.put('/updateprofile',protect,updateProfile)
router.get('/users',users)


//chat stuff

router.post('/addchat',protect,addChat)
router.post('/deletechat',protect,deleteChat)
router.get('/chatList',protect,chatList)





module.exports=router;