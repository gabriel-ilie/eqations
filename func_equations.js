var random_choice = (array) => {
	return array[Math.floor(Math.random() * array.length)];
}

var generate_parameter = (positive=false, integer=true, max_value=100, decimal_precision=2) => {
	if (!positive){
		//prefer positive parameters - 80%
		positive = random_choice([true, true, true, true, false]);
	}
	var result = 0;
	while (result===0){
		temp_decimal_precision = Math.floor((0.3 + 0.7*Math.random()) * Math.pow(10, decimal_precision));
		//console.log('decimal_precision', temp_decimal_precision);
		if(positive){result = Math.pow(Math.random(),5) * (max_value + 1);}
		else{result = Math.pow((Math.random()*2-1), 5) * (max_value + 1);}
		if(integer){result = Math.floor(result);}
		else{
			result = Math.floor(result*temp_decimal_precision)/temp_decimal_precision; 
		}
	}
	return result;
}

var reset_equation = (equation_prototype_list, integer_parameters) => {
	var equation = random_choice(equation_prototype_list);
	var text = 'abcdefghABCDEFGH';
	for (var i = 0; i < text.length; i++) {
		if (i >=8){equation = equation.replace(text.charAt(i), String(generate_parameter(positive=false, integer=integer_parameters, max_value=7)));}
		else {equation = equation.replace(text.charAt(i), String(generate_parameter(positive=false, integer=integer_parameters, max_value=100)));}
		}
	return equation;
}

var to_string = (text, option, decimal_precision=3) => {
	n_text = nerdamer(text).expand();
	if (option == 'decimal'){
		text = n_text.text('decimals', decimal_precision+1); 
		text = nerdamer(text).text('decimals', decimal_precision);}
	else {text = n_text.text('fractions');}
	//console.log(text);
	//console.log(nerdamer(text).toTeX(option));
	return nerdamer.toStringFromLaTeX(nerdamer(text).toTeX(option));
}

var to_string_decimal = (text, decimal_precision=3) => {return to_string(text, 'decimal', decimal_precision=decimal_precision);}
var to_string_fraction = (text) => {return to_string(text, 'fractions');}

var insert_into_html_list = (list_id, text, li_attributes, latex=false) => {
	//console.log(list_id, text, li_attributes, latex);
	var li = document.createElement('li');
	if (latex){
    	var span = document.createElement('span');
    	var latex_text_n = apply_operation(text, '+0', latex=true);
    	katex.render(latex_format(latex_text_n, display_type), span, {throwOnError: false});
    	li.appendChild(span);
	}
	else {li.appendChild(document.createTextNode(text));}
	
	for (let [key, value] of Object.entries(li_attributes)) {
		li.setAttribute(key, value);	
	}
	    	
	var ul = document.getElementById(list_id);
	var temp_list = [li];
	for (const li of ul.children){
		temp_list.push(li)
	}
	
	while(ul.firstChild){
		ul.removeChild(ul.firstChild);
	}    
	
	for (const li of temp_list){
		ul.appendChild(li);	
	}
	return;
}

var fraction_toggle = (cb) => {
	if (cb.checked) {
		this.display_type = 'fraction';
	}
	else{this.display_type = 'decimal';}
}

var simple_equation_toggle = (cb) => {
	if (cb.checked) {
		this.equation_simple = true;
	}
	else{this.display_type = false;}
}

var latex_format = (text, display_type) => {
	var result = nerdamer(text).toTeX(display_type);
	result = result.replace(/text/g, 'L');
	
	result = result.replace(/x/g, '\\color{blue} \\textbf{x} \\color{black}');
	result = result.replace(/y/g, '\\color{red} \\textbf{y} \\color{black}');
	result = result.replace(/z/g, '\\color{green} \\textbf{z} \\color{black}');
	
	result = result.replace(/L/g, 'text');
	//console.log(result);
	return result; 
}    

var apply_operation = (equation, operation, display_type, latex=false) => {
	var sides = equation.split('=');
	if (operation.includes('=')){
		var temp = operation.split('=');
		var substitution = {};
		substitution[temp[0]] = temp[1];
	}

	for (var i=0; i<sides.length; i++){
		if ((latex) && (display_type === 'decimal')){
			if (operation.includes('=')){
				sides[i] = to_string_decimal(nerdamer(sides[i], substitution).text('fraction'), decimal_precision=decimal_precision);
			}
			else{
				sides[i] = to_string_decimal('('+sides[i]+')'+operation, decimal_precision=decimal_precision);
			}
		}
		else {
			if (operation.includes('=')){
				sides[i] = to_string_fraction(nerdamer(sides[i], substitution).text('fraction'));
			}
			else{
				sides[i] = to_string_fraction('('+sides[i]+')'+operation);	
			}
			
		} 
	}
	var result = sides.join('=');
	return result; 
}
