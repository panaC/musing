const { cellx } = require('cellx');

let user = {
firstName: cellx('Matroskin'),
           lastName: cellx('Cat'),

           fullName: cellx(function() {
               return (user.firstName() + ' ' + user.lastName()).trim();
               })
};

user.fullName.subscribe(function() {
    console.log('fullName: ' + user.fullName());
    });

console.log(user.fullName());
// => 'Matroskin Cat'

user.firstName('Sharik');
user.lastName('Dog');
// => 'fullName: Sharik Dog'

user.firstName('hello');
user.lastName('world');

process.nextTick(() => {

    user.firstName('lolo');
    user.lastName('nonon');
    });
