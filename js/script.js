$(document).ready(function(){
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDjkXjsjT3G3fIvyxP84HzST-Ie0gHmJYM",
        authDomain: "wk11hw-7325d.firebaseapp.com",
        databaseURL: "https://wk11hw-7325d.firebaseio.com",
        projectId: "wk11hw-7325d",
        storageBucket: "wk11hw-7325d.appspot.com",
        messagingSenderId: "445418244339"
    };
    firebase.initializeApp(config);

  // Firebase database reference
  var dbChatRoom = firebase.database().ref().child('chatroom');
  var dbUser = firebase.database().ref().child('user');

  var photoURL;
  var $img = $('img');
  
  // REGISTER DOM ELEMENTS
  const $messageField = $('#messageInput');
  const $messageList = $('#messages');
  const $email = $('#email');
  const $password = $('#password');
  const $btnSignIn = $('#btnSignIn');
  const $btnSignUp = $('#btnSignUp');
  const $btnSignOut = $('#btnSignOut');
  const $message = $('#messages');
  const $hovershadow = $('.hover-shadow');
  const $signInfo = $('#sign-info');
  const $btnSubmit = $('#btnSubmit');
  const $userName = $('#userName');
  const $file = $('#file');
  const $profileName = $('#profile-name');
  const $profileEmail = $('#profile-email');
  const $profileAge = $('#profile-age');
  const $profileOccupation = $('#profile-occupation');
  const $page = $('.page');
  const $Profile = $("#Profile");

  // Hovershadow
  $hovershadow.hover(
    function(){
      $(this).addClass("mdl-shadow--4dp");
    },
    function(){
      $(this).removeClass("mdl-shadow--4dp");
    }
  );
  
  var storageRef = firebase.storage().ref();

  function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.target.files[0];

    var metadata = {
      'contentType': file.type
    };
    
    // Push to child path.
    // [START oncomplete]
    storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
      console.log('Uploaded', snapshot.totalBytes, 'bytes.');
      console.log(snapshot.metadata);
      photoURL = snapshot.metadata.downloadURLs[0];
      console.log('File available at', photoURL);
    }).catch(function(error) {
      // [START onfailure]
      console.error('Upload failed:', error);
      // [END onfailure]
    });
    // [END oncomplete]
  }

  window.onload = function() {
    $file.change(handleFileSelect);
    // $file.disabled = false;
  }
  
  // SignIn/SignUp/SignOut Button status
  var user = firebase.auth().currentUser;
  if (user) {
    //$btnSignIn.attr('disabled', 'disabled');
    //$btnSignUp.attr('disabled', 'disabled');
    //$btnSignOut.removeAttr('disabled')
  } else {
    //$btnSignOut.attr('disabled', 'disabled');
    //$btnSignIn.removeAttr('disabled')
    //$btnSignUp.removeAttr('disabled')
  }

  // Sign In
  $btnSignIn.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signIn
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(){
      console.log('SignIn User');
    });
  });

  // SignUp
  $btnSignUp.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signUp
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(user){
    	user.sendEmailVerification().then(function() {
  			// Email sent.
  			$signInfo.html("Verification email has been sent to " + user.email + " .");
		}, function(error) {
  			// An error happened.
  			$signInfo.html("Error. Please contact service center.");
		});
      console.log("SignUp user is "+user.email);
      const dbUserid = dbUser.child(user.uid);
      dbUserid.push({email:user.email});
    });
  });

  // Listening Login User
  firebase.auth().onAuthStateChanged(function(user){
    if(user) {
      console.log(user);
      $signInfo.html(user.email+" is login...");
      //$btnSignIn.attr('disabled', 'disabled');
      //$btnSignUp.attr('disabled', 'disabled');
      //$btnSignOut.removeAttr('disabled')
      userProfile(user);
      
      // Add a callback that is triggered for each chat message.
      dbChatRoom.limitToLast(10).on('child_added', function (snapshot) {
        //GET DATA
        var data = snapshot.val();
        var username = data.name || "anonymous";
        var message = data.text;

		
        //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
        var $messageElement = $("<li>");
        var $nameElement = $("<strong class='example-chat-username'></strong>");
        $nameElement.text(username);
        $messageElement.text(message).prepend($nameElement);

        //ADD MESSAGE
        $messageList.append($messageElement)

        //SCROLL TO BOTTOM OF MESSAGE LIST
        $messageList[0].scrollTop = $messageList[0].scrollHeight;
      });//child_added callback

      user.providerData.forEach(function (profile) {
        console.log("Sign-in provider: "+profile.providerId);
        console.log("  Provider-specific UID: "+profile.uid);
        console.log("  Name: "+profile.displayName);
        console.log("  Email: "+profile.email);
        console.log("  Photo URL: "+profile.photoURL);
      });
    } else {
      console.log("not logged in");
      $profileName.html("N/A");
      $profileEmail.html('N/A');
      $profileOccupation.html("N/A");
      $profileage.html('N/A');
      $img.attr("src","");
      $userName.val('');
      $file.val('');
      $message.html('');
    }
  });

  // SignOut
  $btnSignOut.click(function(){
    firebase.auth().signOut();
    console.log('LogOut');
    $signInfo.html('No one login...');
    //$btnSignOut.attr('disabled', 'disabled');
    //$btnSignIn.removeAttr('disabled')
    //$btnSignUp.removeAttr('disabled')
  });

    
  // LISTEN FOR KEYPRESS EVENT
  $messageField.keypress(function (e) {
    var user = firebase.auth().currentUser;
    if (e.keyCode == 13) {
      //FIELD VALUES
      var username = user.displayName;
      var message = $messageField.val();
      console.log(username);
      console.log(message);

      //SAVE DATA TO FIREBASE AND EMPTY FIELD
      dbChatRoom.push({name:username, text:message});
      $messageField.val('');
    }
  });

  function userProfile(user){
    var username = user.displayName;
	//var occupation = snapshot.val().occupation;
    //var age = snapshot.val().age;
    //var description = snapshot.val().description;
    var photoUrl = user.photoURL;

    $profileName.html(username);
    $profileEmail.html(user.email);
    //$profileOccupation.html(occupation);
    //$profileAge.html(age);
    //$profileDescription.html(description);
    //$img.attr("src", imageUrl);
    $img.attr("src", photoUrl);
    $userName.val(username || user.email);
  }

	// Submit
  $btnSubmit.click(function(){
    var user = firebase.auth().currentUser;
    const $userName = $('#userName').val();

    const promise = user.updateProfile({
      displayName: $userName,
      photoURL: photoURL
    });
    promise.then(function() {
      console.log("Update successful.");
      user = firebase.auth().currentUser;
      if (user) {
        userProfile(user);
        const loginName = user.displayName || user.email;
        //$signInfo.html(loginName+" is login...");
      }
    });
  });
});
