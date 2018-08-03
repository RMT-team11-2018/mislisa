const inputs = document.querySelectorAll('.input');
const button = document.getElementById("regBtn");
const passwordInput = document.getElementsByName('password')[1];

const patterns = {
	nickname: /^[a-z0-9]{4,12}$/i,
	password: /[\w@_-]{8,20}/, // password: /[a-z\d@_-]{8,20}/i
	email: /^([a-zA-Z\d_\.-]+)@([a-z\d-]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/
};

function validate(field,regex){
	if(field.name=='repeatPassword'){
		if(field.value==passwordInput.value){
			field.className = 'registration valid';
		}else{
			field.className = "registration invalid";
		}
	}else{
		if(regex.test(field.value)){
			field.className = "registration valid";
		}else{
			field.className = "registration invalid";
		}
	}
}

function validateButton(){
  var counter = 0;
  inputs.forEach((input)=>{
		if(input.attributes.name.value=='repeatPassword'){
			if(input.value==passwordInput.value)
				counter++;
		}
		else if(patterns[input.attributes.name.value].test(input.value))
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
