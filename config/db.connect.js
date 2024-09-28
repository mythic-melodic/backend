import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    user: 'your_user',
    host: 'localhost',
    database: 'your_database',
    password: 'your_password',
    port: 5432,
});

client.connect()
    .then(() => console.log('Kết nối thành công!'))
    .catch(err => console.error('Lỗi kết nối:', err));


client.query('SELECT * FROM your_table')
    .then(res => {
        console.log('Kết quả truy vấn:', res.rows);
    })
    .catch(err => {
        console.error('Lỗi khi thực hiện truy vấn:', err);
    })
    .finally(() => {
        client.end(); 
    });
