sudo apt update
sudo apt install -y curl
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
cd payhubApi/
npm i
sudo npm install -g pm2
pm2 start npm --name "PayhubBackendAPI" -- start
pm2 logs 0 --lines 100
cd ..
sudo apt update
sudo apt install nginx
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/payhubApi
sudo nano /etc/nginx/sites-available/payhubApi
sudo ln -s /etc/nginx/sites-available/payhubApi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
cd payhubApi/
ls
cd lib/
ls
cd user/
sudo nano adminService.js 
sudo nano /etc/nginx/sites-available/payhubApi
sudo systemctl restart nginx
sudo nginx -t
sudo nano /etc/nginx/sites-available/payhubApi
sudo apt update
sudo apt install certbot
sudo certbot --nginx -d api.payhub.link
cd /etc/nginx/sites-available/
sudo certbot --nginx -d api.payhub.link
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.payhub.link
pm2 logs 0 --lines 100
pm2 restart all
pm2 logs 0 --lines 100
pm2 restart all
pm2 status
pm2 restart all
pm2 logs --lines 100
pm2 restart all
pm2 logs --lines 100
cd payhubApi/`
cd payhubApi
ls
npm i
pm2 restart all
pm2 logs --lines 100
pm2 restart all
pm2 logs --lines 100
pm2 restart all
pm2 logs --lines 100
pm2 restart all
pm2 restart all --update-env
pm2 logs --lines 100
pm2 restart all --update-env
pm2 logs --lines 100
pm2 restart all 
pm2 logs --lines 100
cd payhubApi/
npm i
pm2 restart all 
pm2 logs --lines 100
npm i
pm2 restart all 
pm2 logs --lines 100
pm2 restart all 
cd payhubApi/
ls
sudo nano server.js 
pm2 restart all 
pm2 logs --lines 100
npm i
cd payhubApi/
npm i
pm2 restart all 
pm2 logs --lines 100
pm2 restart all 
pm2 logs --lines 100
pm2 restart all 
pm2 logs --lines 100
pm2 restart all 
pm2 logs --lines 100
pm2 restart all 
pm2 logs --lines 100
pm2 restart all 
pm2 logs --lines 100
pm2 restart all 
pm2 logs --lines 100
pm2 restart all 
pm2 logs --lines 100
pm2 restart all 
pm2 logs --lines 100
pm2 restart all 
pm2 logs --lines 100
pm2 restart all 
pm2 logs --lines 100
pm2 restart all 
pm2 logs --lines 100
pm2 restart all 
pm2 logs --lines 100
ls
cd payhubApi/
ls
cd ..
cd /etc/nginx/sites-available/
ls
sudo cat payhubApi 
cd ..
exit
pm2 restart all
pm2 logs --lines 100
pm2 restart all
pm2 logs --lines 100
pm2 restart all
pm2 logs --lines 100
npm i
cd payhubApi/
npm i
pm2 restart all
pm2 logs --lines 100
pm2 restart all
pm2 logs --lines 100
ls
cd lib/
ls
cd user/
ls
pm2 restart all
pm2 logs --lines 100
cd ..
sudo npm i
pm2 restart all
pm2 logs --lines 100
npm i
pm2 restart all
pm2 logs --lines 100
cd ap
cd payhubApi/
pm2 restart all
pm2 logs --lines 100
pm2 restart all
pm2 logs --lines 100
pm2 restart all
pm2 logs --lines 100
pm2 restart all
pm2 logs --lines 100
