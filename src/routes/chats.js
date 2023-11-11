const express = require('express');
const {isAuth} = require('../middleware/isAuth')
const router = express.Router();
const {renderChatPanel,getMessages,getConversations,getProductChat} = require('../controllers/chatController');


router.use(isAuth);

router.get('/',renderChatPanel)

router.get('/messages',getMessages)

router.get('/getConversations',getConversations)






module.exports = router;