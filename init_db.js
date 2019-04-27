var knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: ".data/db.sqlite3"
    },
    useNullAsDefault: true,
    debug: true,
});

async function init() {
      knex.schema.dropTableIfExists('user')
      .then(() => {
      knex.schema.createTable('user', (table) => {
        table.increments('id');
        table.string('pseudo').unique();
        table.string('email').unique();
        table.string('password').notNull();
        table.integer('win').defaultTo(0);
        table.integer('lose').defaultTo(0);
        table.string('token');
      })
        .then(() => console.log("table created"))
        .catch((err) => { console.log(err); throw err })
        .then(() =>{
        knex('user').insert({pseudo: 'Maxime', password:'maxime', email:'maxime.elkael@gmail.com'}).then(()=>{})
      }).then(() => {
        knex('user').select('pseudo')
        .then(function (records) {
           console.log(records)
        })
        .then(() => {
          knex.destroy()
        })
      })
      })  
}

init()