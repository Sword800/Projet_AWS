var knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: ".data/db.sqlite3"
    },
    debug: true,
    useNullAsDefault: true
});

async function init_dropUsers()
{
   var drop_users = await knex.schema.dropTableIfExists('users');
};


async function init_tableUsers()
{
  
 var create_table = await knex.schema.createTable('users', function (table) {
   table.increments('id');
   table.string('pseudo').unique();
   table.string('email').unique();
   table.string('password').notNull();
   table.integer('win').defaultTo(0);
   table.integer('lose').defaultTo(0);
   table.string('token');
});
   
};

async function info_column()
{
  var info_col = await knex('users').columnInfo();
};

async function ajout()
{
  var add = knex('users').insert({pseudo: 'Maxime', password:'maxime', email:'maxime.elkael@gmail.com'}); 
};

async function selection()   
{
  var aff = await knex('users');
  console.log(aff);
};

async function destroy()   
{
 var destroy = await knex.destroy();
};

async function bdd() 
{  
  await init_dropUsers();
  await init_tableUsers();
  await ajout();
  await info_column();
  await selection();
  await destroy();
}

bdd();