const inputs = document.querySelectorAll('.input');
const button = document.getElementById("regBtn");
const patterns = {

	telephone: /^\d{10}$/,
	username: /^[a-z0-9]{4,12}$/i,
	password: /[\w@_-]{8,20}/, // password: /[a-z\d@_-]{8,20}/i
	slug: /^[a-z\d-]{4,20}$/,
	email: /^([a-zA-Z\d_\.-]+)@([a-z\d-]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/

};

function validate(field,regex){
	if(regex.test(field.value)){
		field.className = "registration valid";
	}else{
		field.className = "registration invalid";
	}
}

button.addEventListener('click',function(){
  //code here!
  //document.writeln("radi");
});

function validateButton(){
  var counter = 0;
  inputs.forEach((input)=>{
    if(patterns[input.attributes.name.value].test(input.value))
      counter++;
  });
  if(counter==inputs.length)
    button.disabled = false;
	else
		button.disabled = true;
}

inputs.forEach((input)=>{
	input.addEventListener('keyup',(e)=>{
		validate(e.target,patterns[e.target.attributes.name.value]);
    validateButton();
	});
});
