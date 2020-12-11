sudo iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
pm2 status
git pull origin master
yarn build
cd build
pm2 start server.js