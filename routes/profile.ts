const express = require('express');
const router = express.Router();

// middleware that is specific to this router
/*
router.use((req, res, next) => {
    console.log('Time: ', Date.now())
    next()
})
*/

router.get("/", function (request:Request, response:Response) {
    if(request.session.loggedin = true) {
        console.log("logged in")
    } else {
        console.log("not logged in")
    }
});

module.exports = router;
