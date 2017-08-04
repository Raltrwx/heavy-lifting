var contractModel      = require('../models/contracts.js');
var User = require('../models/User');
var ObjectId = require('mongodb').ObjectID;
var express = require('express');
var app = express();



///////////////////////////////////////////////
////     SET YOUR APP.JSON DETAILS        //// 
/////////////////////////////////////////////
//Not working ? try double dots on the json url..
var myModule = require('../app.json');
var sitename = myModule.sitename
var website = myModule.website
var repo = myModule.repo

////////////////////////////////////////////
/////  GO TO PAGE NEW CONTRACT        ///// 
//////////////////////////////////////////
exports.newcont = function(req, res) {
    //Perform Routing for Varios user type on the home page.
    if (req.user) {
      //Create client token for Braintree payments.
       res.render('newcont',{
        pagetitle: 'New contract | '+sitename ,
      });

    } else {
      res.redirect('/signin');
    }
  }; 

///////////////////////////////////////////////
///////   CREATE CONTRACT STATIC      ////////
/////////////////////////////////////////////
exports.createcontstatic = function(req, res) {
//console.log('//////////////////////////////////////////')
//console.log('//////    CREATE NEW CONTRACT     ////////')
// console.log('////////////////////////////////////////')
if (req.user) {
  req.assert('title', 'Title cannot be blank').notEmpty();
  req.assert('email', 'Please ensure that the email address is valid.').isEmail();
  req.assert('email', 'Please ensure that the email address is included.').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });
  var errors = req.validationErrors();
  if (errors) {
   req.flash('error', errors);
   return res.redirect('/contracts/new');
 }
    //check the user name for duplicate.
    contractModel.findOne({ 'entry.title': req.body.name }, function(err, title) {
    	if (title) {
    		req.flash('error', { msg: 'The contract name you have entered already exists' });
    		return res.redirect('/contracts/new');
    	}
      var temp = {}
      temp['entry'] ={
        title: req.body.title,
        email: req.body.email,
        discord: req.body.discord,
        organization: req.body.organization,
        description: req.body.description,
        password: req.body.password,
        owner : req.user.username,
        members : ''
      }        
      user = new contractModel(temp);
      user.save(function(err) {
        res.redirect('/contracts/'+req.body.title);
      });
    });
  } else {
   res.redirect('/signin');
 }
}

////////////////////////////////////////////
////////// PROFILE ORGANIATION ////////////
//////////////////////////////////////////
exports.contprofile = function(req, res) {
    //check the user name for duplicate.
    contractModel.findOne({ 'entry.name': req.params.orgname }, function(err, username) {
      if (username) {
        res.render('account/orgprofile',{
          owner:req.owner,
          ownerParse:req.ownerParse,
          members:req.members ,
          membersParse:req.membersParse,
          requests:req.requests ,
          requestsParse:req.requestsParse,
          orgowner : req.orgowner ,
          orgmember : req.orgmember ,
          orgsharerequest : req.orgsharerequest,
          contract : username,
          contracts : req.userorgs ,
          title: username.entry.name + ' | '+sitename ,
        }
        )
      } else {
        return res.redirect('/');
      }
    })
  }

////////////////////////////////////////////
////////// PROFILE ORGANIATION ////////////
//////////////////////////////////////////
exports.contuserread = function(req, res) {
    //check the user name for duplicate.
    contractModel.findOne({ 'entry.name': req.params.orgname }, function(err, username) {
      if (username) {
        res.render('account/orgprofile',{
          owner:req.owner,
          ownerParse:req.ownerParse,
          members:req.members ,
          membersParse:req.membersParse,
          requests:req.requests ,
          requestsParse:req.requestsParse,
          contract : username,
          contracts : req.userorgs ,
          title: username.entry.name + ' | '+sitename ,
        }
        )
      } else {
        return res.redirect('/');
      }
    })
  }

////////////////////////////////////////////
////////// PROFILE ORGANIATION ////////////
//////////////////////////////////////////
exports.ajaxcontuserread = function(req, res, next) {
  if (req.user) {
    //console.log(req.user)
    var username =  req.user.username
    var query1 = contractModel.find(
      {$or: [
        {"entry.owner": username },
        {"entry.members":  username }
        ]}
        )
    query1.exec(function (err, query1_return) {
      if(err){console.log('Error Here'); return;} 
      req.usercont = query1_return
      next();
    })
  } else {
   next();
 }
}

//////////////////////////////
//////////  PAGE ////////////
////////////////////////////
exports.page = function(req, res) {
  if (req.contowner) {
   var template =  req.params.page 
    //check the user name for duplicate.
    contractModel.findOne({ 'entry.title': req.params.orgname }, function(err, username) {
      if (username) {
        res.render('orgsettings/'+template,{
          orgowner : req.orgowner ,
          orgmember : req.orgmember ,
          contract : username,
          contracts : req.userorgs ,
          pagetitle: 'Settings | '+username.entry.name   ,
        }
        )
      } else {
        return res.redirect('/');
      }
    })
  } else {
    return res.redirect('/');
  }
};

/////////////////////////////////////
////////// SETTINGS PAGE ///////////
///////////////////////////////////
exports.settings = function(req, res) {
  if (req.contowner) {
    //check the user name for duplicate.
    contractModel.findOne({ 'entry.name': req.params.orgname }, function(err, username) {
      if (username) {
        res.render('orgsettings/settings',{
          orgowner : req.orgowner ,
          orgmember : req.orgmember ,
          contract : username,
          contracts : req.userorgs ,
          title: 'Settings | '+username.entry.name   ,
        }
        )
      } else {
        return res.redirect('/');
      }
    })
  } else {
    return res.redirect('/');
  }
};

//////////////////////////////////////
////////// COMPONENTS PAGE ///////////
/////////////////////////////////////
exports.components = function(req, res) {
    //check the user name for duplicate.
    contractModel.findOne({ 'entry.title': req.params.contname }, function(err, username) {
      if (username) {
        var ids = '58d371b01373c63dccdee169'
        var Formids = '58aa74140b9d3241280ecf17'
        res.render('contsettings/components', {
          siteName : siteName,
          items : JSON.stringify(ids),
          Formids : JSON.stringify(Formids),
          contract : username,
          contracts : req.usercont ,
          title: 'Components | '+username.entry.name   ,
        });
      } else {
        return res.redirect('/');
      }
    })
  };

////////////////////////////////////
////////// ASSEMBLIES PAGE ////////
//////////////////////////////////
exports.assemblies = function(req, res) {
    //check the user name for duplicate.
    contractModel.findOne({ 'entry.name': req.params.contname }, function(err, username) {
      if (username) {
        res.render('contsettings/assemblies',{
          contract : username,
          contracts : req.usercont ,
          title: 'Assemblies | '+username.entry.name   ,
        }
        )
      } else {
        return res.redirect('/');
      }
    })
  };

///////////////////////////////////
////////// PEOPLE PAGE ///////////
/////////////////////////////////
exports.people = function(req, res) {
    //check the user name for duplicate.
    contractModel.findOne({ 'entry.name': req.params.orgname }, function(err, username) {
      if (username) {
        res.render('orgsettings/people',{
          owner:req.owner,
          ownerParse:req.ownerParse,
          members:req.members ,
          membersParse:req.membersParse,
          requests:req.requests ,
          requestsParse:req.requestsParse,
          orgowner : req.orgowner ,
          orgmember : req.orgmember ,
          contract : username,
          contracts : req.userorgs ,
          title: 'People | '+username.entry.name ,
        }
        )
      } else {
        return res.redirect('/');
      }
    })
  };

///////////////////////////////////
////////// ORGPUT PAGE ///////////
/////////////////////////////////
exports.orgPut = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  var errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors);
    res.redirect('/contracts/'+req.params.orgname+'/settings/profile');
  }
  contractModel.findOne({ 'entry.name': req.params.orgname }, function(err, contractItem) {
    contractModel.findById(contractItem._id, function (err, orgid) {
      if (err) return handleError(err);
      if (orgid) { 
        //Profile Picture saving.
        var image = req.body.croppedImg
        var fs = require('fs');
        var directory = 'public/uploads/'
        var fileName = directory+orgid._id+'.jpg'
        var data = image.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFile(fileName, data, {encoding: 'base64'}, function(err){
          //Finished
        });
        //Painful parse issue.
        var temp = JSON.parse(JSON.stringify(orgid.entry))
        temp.picture = '/uploads/'+orgid._id+'.jpg'
        //Assign
        if (req.body.name !=null) {
         temp.name = req.body.name
       }
       temp.displayname = req.body.displayname
       temp.description = req.body.description
       temp.location = req.body.location
       temp.url = req.body.url
       temp.email = req.body.email
       temp.displayemail = req.body.displayemail
       orgid.entry = temp    
       orgid.save(function(err,doc) {
        req.flash('success', { msg: 'Your profile information has been updated.' });
        res.redirect('/contracts/'+req.params.orgname+'/settings/profile');
      });
     } else {
      req.flash('error', { msg: 'Something went wrong here.' });
      res.redirect('/contracts/'+req.params.orgname+'/settings/profile');
    }
  });
  })
};

///////////////////////////////////////////
//////////  Contract LIST     ////////////
/////////////////////////////////////////
exports.contlist = function(req, res) {
  contractModel.find(  function(err, username) {
    res.render('contlist',{
      username : username,
      pagetitle: 'Contracts | '+sitename+'',
    });
  });
};

////////////////////////////////////////////
//////////  contract LEAVE ////////////
//////////////////////////////////////////
exports.leavecontract = function(req, res) {
  if (req.user) {
    contractModel.findOne( {"entry.name" : req.params.ids}, function(err, contract) {
      var temp = JSON.parse(JSON.stringify(contract.entry))
      if (temp.owner == req.user.username) {
        temp.owner = ''
      }
      var tempArry =[]  
      for (var i = 0; i < temp.members.length; i++) {
        if (temp.members[i] == req.user.username) {
        } else {
          tempArry.push(temp.members[i])
        }
      }
      temp.members = tempArry
      contract.entry = temp    
      contract.save(function(err) {
        req.flash('success', { msg: 'You are no longer a member of the contract '+contract.entry.title+'.' });
        res.redirect('/users/'+req.user.username+'/settings/contracts');
      });
    });
  } else {
    return res.redirect('/');
  }
};

////////////////////////////////////////////
//////////  contract KICK      ////////////
//////////////////////////////////////////
exports.kickcont = function(req, res) {
  console.log('entering')
  if (req.user) {
    contractModel.findOne( {"entry.title" : req.params.title}, function(err, contract) {
      var temp = JSON.parse(JSON.stringify(contract.entry))
      if (temp.owner == req.user.username) {
        var tempArry =[]  
        for (var i = 0; i < temp.members.length; i++) {
          if (temp.members[i] == req.params.username) {
          } else {
            tempArry.push(temp.members[i])
          }
        }
        temp.members = tempArry
        contract.entry = temp    
        contract.save(function(err) {
          req.flash('success', { msg: req.params.username+' was successfully removed from '+contract.entry.title+'.' });
          res.redirect('/contracts/'+contract.entry.name+'/people' );
        });
      } else {
        return res.redirect('/');
      }
    });
  } else {
    return res.redirect('/');
  }
};


////////////////////////////////////////////
//////////  contract DELETE    ////////////
//////////////////////////////////////////
exports.deletecontract = function(req, res) {
  if (req.user) {
    contractModel.remove( {"_id" : req.params.ids}, function(err) {
      if(err){console.log('Error Here'); return;} 
      req.flash('success', { msg: 'Contract deleted.' });
      res.redirect('/users/'+req.user.username);
    })
  } else {
    return res.redirect('/');
  }
};


////////////////////////////////////////////////////////////////
//////////  contract APPROVE USER JOIN REQUEST      ///////////
//////////////////////////////////////////////////////////////
exports.approvecontreq = function(req, res) {
  if (req.user) {
    var query1 = contractModel.findOne(
      {"entry.title":  req.params.title }
      )
    query1.exec(function (err, query1_return) {
      if(err){console.log('Error Here'); return;} 
      if (query1_return.entry.owner == req.user.username ) {
        //Painful parse issue.
        var temp = JSON.parse(JSON.stringify(query1_return.entry))
//Invite and accept request in 1 query , where there is an error trap for multiple added users.
var count=0
if (temp.members) {
  for (var i = 0; i < temp.members.length; i++) {
    temp.members[i]
    if (req.params.username == temp.members[i]) {
      count+=1
    }
  }
  if (count==0) {
    temp.members.push(req.params.username)
  }
} else {
  temp.members = [req.params.username]
}
if (temp.requests) {
//delete request
var temp1 =[]
for (var i = 0; i < temp.requests.length; i++) {
  if (temp.requests[i] == req.params.username) {
  } else {
    temp1.push(temp.requests[i])
  }
}
}
temp.requests = temp1
query1_return.entry = temp
req.params.options ='join'
query1_return.save(function(err) {
  return res.redirect('/');
}); 
} else {
  console.log('User name and contract owner do not match.')
  return res.redirect('/');
}
})
  } else {
    return res.redirect('/');
  }
};



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Middleware -  Limit to 1 query.


////////////////////////////////////
////////// CONTRACT PAGE? //////////
///////////////////////////////////
exports.usercontracts = function(req, res, next) {
  //Work around for the home controller with out paramater request
  if (req.user) { 
    if (!req.params.username) { 
      req.params.username = req.user.username
    }
  }
  var query1 = contractModel.find(
    {"entry.owner":  req.params.username }
    )
  var query2 = contractModel.find(
    {"entry.members": req.params.username }
    )
  query1.exec(function (err, query1_return) {
    query2.exec(function (err, query2_return) {
      if(err){console.log('Error Here'); return;} 
      req.contracts = query2_return
      req.contracts.push.apply(req.contracts, query1_return)
      req.contractsParse = JSON.stringify(req.contracts)
      next();
       //Query end
     })
  })
};


////////////////////////////////////////////////
////////// contract PERMISSION ////////////
//////////////////////////////////////////////
exports.contractpermission = function(req, res, next) {
  //Work around for the home controller with out paramater request
  if (req.user) { 
    contractModel.findOne({ 'entry.title': req.params.orgname }, function(err, contract) {
      //Check if this user is an owner of this contract
      if (contract.entry.owner) {
        if (contract.entry.owner == req.user.username) {
          req.orgowner = true 
        }
      }
      //Check if this user is a memeber
      if (contract.entry.members) {
        for (var i = 0; i < contract.entry.members.length; i++) {
          if (contract.entry.members[i] == req.user.username) {
            req.orgmember = true 
          }
        }
      }
      //Check if this user has requested membership to this contract
      if (contract.entry.requests) {
        for (var i = 0; i < contract.entry.requests.length; i++) {
          if (contract.entry.requests[i] == req.user.username) {
            req.orgsharerequest = true 
          }
        }
      }
      next();
    })
  } else {
    next();
  }
};  

///////////////////////////////////////////////////
//////////  contract SHARE REQUEST ///////////
/////////////////////////////////////////////////
exports.contsharerequest = function(req, res, next) {
  if (req.user) {
    contractModel.findOne({ 'entry.name': req.params.orgname }, function(err, contract) {
      var temp = JSON.parse(JSON.stringify(contract.entry))
      if (temp['requests']) {
        temp['requests'].push(req.user.username)
      } else {
        temp.requests = []
        temp.requests.push(req.user.username)
      }
      contract.entry = temp
      contract.save(function(err,doc) {
        req.flash('success', { msg: 'You requests has been sent to the contract owner.' });
        next();
      });
    });
  } else {
   res.redirect('/signin');
 }
};

////////////////////////////////////////////////////////////////////
//////////  contract OWNER GET FULL USER DETAILS  ///////////
//////////////////////////////////////////////////////////////////
exports.contowneruserdetail = function(req, res, next) {
  contractModel.findOne({ 'entry.title': req.params.orgname }, function(err, contract) {
    if(err){console.log('Error Here'); return;} 
    if (contract) {
     User.findOne({ 'username': contract.entry.owner }).exec(function(err, user) {
      if(err){console.log('Error Here2'); return;} 
      User.find({ 'username': contract.entry.members }).exec(function(err, user1) {
        if(err){console.log('Error Here3'); return;} 
        User.find({ 'username': contract.entry.requests }).exec(function(err, user2) {
          if(err){console.log('Error Here4'); return;} 
          req.owner = user
          req.ownerParse = JSON.stringify(user)
          req.members = user1
          req.membersParse = JSON.stringify(user1)
          req.requests = user2
          req.requestsParse = JSON.stringify(user2)
          next();
        })
      })
    })
   } else {
    next();
  }
});
};

////////////////////////////////
//////////  SEARCH ////////////
//////////////////////////////
exports.contsearch = function(req, res) {
  if (req.user) {
   req.sanitize('username').escape();
   req.sanitize('username').trim();
   var myExp = new RegExp(req.param('username'), 'i');
   contractModel.findOne({ 'entry.name': req.params.orgname }, function(err, contract) { 
     var query1 = User.find(
      {"username" : {
        $regex : myExp,
        $ne: req.user.username ,
        $nin: contract.entry.members ,
      }
    }
    ).limit(10)
     query1.exec(function (err, query1_return) {
      if(err){
        res.send("No user found");
        return;} 
        res.send(
          { users : query1_return}
          );
      });
   })
 } else {
   res.redirect('/');
 }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//contract EMAIL MANAGER.


/*
switch(true){
  case (req.params.options == 'join'):
  var subject = '✔ You have successfully added this user to your account | '+sitename // Subject line
  var msg = 'Your contract account has been successfully modified on '+sitename+' , First time users please complete you contract profile when you get a chance!'
    signupEmail(contracts.name , contracts.email,subject, msg)
  break ;
}*/

///////////////////////////////////////
////     SIGN UP EMAIL SEND       //// 
/////////////////////////////////////
function signupEmail(username , email,subject , msg){
  var port = process.env.MAIL_PORT
  var useremail = process.env.MAIL_USERNAME
  var passwords = process.env.MAIL_PASSWORD
  var temp = {}
  'use strict';
  var nodemailer = require('nodemailer');
// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
  host: 'mail.isithelo.com',
  tls: {
    rejectUnauthorized: false
  },
    secure: false, // secure:true for port 465, secure:false for port 587
    auth: {
      user: useremail,
      pass: passwords,
    }
  }); 
var mailOptions = {
  from: username + ' ' + '<'+ email + '>', // sender address
  to: process.env.MAIL_USERNAME, // list of receivers
  subject: '✔ Your contract account modification was successfully completed | '+ sitename, // Subject line
  html:  'contract account modification :' + username + ' email : ' +  email,
}
// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log(error);
  }
  var mailOptions = {
  from: 'The '+sitename+' Team' + ' ' + '<'+ process.env.MAIL_USERNAME + '>', // sender address
  to: email, // list of receivers
  subject: subject, // Subject line
  html:  msg, //HTML msg body
}
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log(error);
  }
});
});
}