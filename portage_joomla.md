# Portage du template dans Joomla.

## 1. <u>Objectif</u>: 
Il est interessant de porter le template sous Joomla (ou un autre CMS) car cela permettrait à une personne non developpeur 
de modifier les contenus du site. Dans ce tutorial, nous allons travailler sur Joomla (à venir wordpress).

## 2. <u>Installation de l'environnement</u>: 
 Pour éviter d'installer une LAMPP stack sur notre machine, nous allons avoir recours à docker.
 Le document de référence est ici: https://doc.ubuntu-fr.org/docker_lamp (je ne fais que recopier cette partie et éventuellement, reformuler ou clarifier des parties)

### 2.a. Installation de docker
Debian n'intègre pas par défaut le répository contenant Docker Engine. ON peut donc installer docker de plusieurs manières mais nous allons utiliser la méthode où on met à jour notre repository.

(le document de référence est https://docs.docker.com/install/linux/docker-ce/debian/ pour cette installation)

- Desinstaller les paquets Docker éventuellement installés sur la machine:
```bash
    patou@pc-pa:~$ sudo apt-get purge docker lxc-docker docker-engine docker.io
```
- Mettre à jour les paquets installés pour utiliser des repository en https:
```bash
    patou@pc-pa:~$ sudo apt install apt-transport-https ca-certificates curl software-properties-common gnupg2
```
- On va récupérer le certificat officiel de Docker (pour nous assurer qu'on installe bien la version offcielle). Pour cela, nous allons télécharger la clé GPG officiel.
```bash
    patou@pc-pa:~$ curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
```
- Vérifions que la commande `apt-key add - ` nous a rajouté la clé officielle de Docker (9DC8 5822 9FC7 DD38 854A E2D8 8D81 803C 0EBF CD88). pour cela, on donne à la commande `apt-key fingerprint` les 6 derniers octets de la clé.
 ```bash
    patou@pc-pa:~$ sudo apt-key fingerprint 0EBFCD88
    pub   rsa4096 2017-02-22 [SCEA]
          9DC8 5822 9FC7 DD38 854A  E2D8 8D81 803C 0EBF CD88
    uid           [ unknown] Docker Release (CE deb) <docker@docker.com>
    sub   rsa4096 2017-02-22 [S]
 ```
Donc on a bien la clé qui est installé. Cela nous permet de nous assurer qu'on isntallera bien la version officielle de Docker. 

- Mettre à jour notre fichier `/etc/apt/sources.list` pour nous permettre l'installation de Docker.
Pour rajouter une ligne dans ce fichier de configuration, on peut utiliser la commande `apt-add-repository`ou `add-apt-repository`. La ligne que nous voudrions rajouter dans `sources.list` est la suivante:
`deb [arch=amd64] https://download.docker.com/linux/debian stretch stable` 
qu'on pourrait rajouter à la main en tant que root ou qu'on pourrait rajouter en ligne de commande comme suit:
```bash
    patou@pc-pa:~$ sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
```
- mise à jour des repository et installation de Docker (enfin)
```bash
    patou@pc-pa:~$ sudo apt-get update
    Réception de:18 https://download.docker.com/linux/debian stretch/stable amd64 Packages [11,9 kB] 1 113 ko réceptionnés en 1s (1 028 ko/s)                                                         
    Lecture des listes de paquets... Fait
    patou@pc-pa:~$ sudo apt-get install docker-ce docker-ce-cli containerd.io
    Lecture des listes de paquets... Fait
    Construction de l'arbre des dépendances       
    Lecture des informations d'état... Fait
    Les paquets suivants ont été installés automatiquement et ne sont plus nécessaires :
      gconf2 gksu libgksu2-0 libglade2-0 net-tools python-glade2 python-gobject python-notify rfkill
    Veuillez utiliser « sudo apt autoremove » pour les supprimer.
    The following additional packages will be installed:
      aufs-dkms aufs-tools cgroupfs-mount dkms pigz
    Paquets suggérés :
      aufs-dev python3-apport menu
    Les NOUVEAUX paquets suivants seront installés :
      aufs-dkms aufs-tools cgroupfs-mount containerd.io dkms docker-ce docker-ce-cli pigz
    0 mis à jour, 8 nouvellement installés, 0 à enlever et 4 non mis à jour.
    Il est nécessaire de prendre 22,8 Mo/85,7 Mo dans les archives.
    Après cette opération, 385 Mo d'espace disque supplémentaires seront utilisés.
    Souhaitez-vous continuer ? [O/n]
```
A partir de ce moment, Docker est installé.

- test de l'installation (installation d'une application helloworld):
```bash
    patou@pc-pa:~/Documents/docker_course$ sudo docker run hello-world
```
Si l'installation est OK, alors on verra le message `Hello from Docker!` en autres.
On peut également, voir si l'image docker de 'Hello world' est bien installé par la commande suivante:
```bash
    patou@pc-pa:~/Documents/docker_course$ sudo docker run hello-world
```
```bash
patou@pc-pa:~/Documents/docker_course$ sudo docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
hello-world         latest              fce289e99eb9        11 months ago       1.84kB
```

- Pour finir l'installation, on va donner les droits à notre compte utilisateur pour pouvoir manipuler les containers Docker. Cela nous permettra en tant qu'utilisateur de manipuler les containers. Cependant, cela posera aussi un problème de sécurité car cela pourrait permettre une escalation de privilège plus tard.
```sh
 patou@pc-pa:~/Documents/docker_course$ sudo usermod -aG docker $USER
```

### 2.b. Mise en place des répertoires de travail
Par défaut, les fichiers dockers ne sont pas persistantes (tout est oublié/réinitialisé à chaque lancement du conteneur).
L'intérêt de l'option -v (volume) de Docker est de créer une sorte de lien symbolique entre le conteneur et le système hôte, ainsi les fichiers modifiés par le conteneur seront persistés sur le système. En bref, nous pourrions, faire persister des configuration avec les liens symboliques.

 Commençons donc par créer des répertoires pour le contenu que l'on souhaite modifier et conserver, en l'occurrence les fichiers du site et les bases de donnés : 
 
 ```bash
 mkdir -p ~/Documents/docker_cours/www ~/Documents/docker_cours/mysql
 ```
 ```bash
 patou@pc-pa:~/Documents$ cd ~/Documents/docker_cours
 ```
 ```bash
    patou@pc-pa:~/Documents/docker_cours$ tree
    .
    ├── mysql
    └── www

    2 directories, 0 files
```

### 2.c. Installation de la LAMPP Stack
- <u>méthode simple (pour la documentation mais à ne pas faire)</u>

    LAMPP peut être installé de deux manières (méthode simple et avancée)

    La méthode simple consiste à juste télécharger un container tout prêt (à partir de https://hub.docker.com/r/lioshi/lamp/) et de l'utiliser. Ce container est basée sur *Debian Jessie, PHP 5, Apache 2,* et *MySQL*.
    La commande pour la méthode simple est :
    ```bash
    docker run -v ~/Documents/docker_cours/www:/var/www/html -v ~/Documents/docker_cours/mysql:/var/lib/mysql -p 80:80 -p 3306:3306 --restart=always lioshi/lamp:php5
    ```
    L'option **-v** (volume) relie les répertoires locaux ~/Documents/docker_cours/www et ~/Documents/docker_cours/mysql aux répertoires /var/www/html et /var/lib/mysql de l'image Debian dans le conteneur.
    L'option **-p** (port) relie les ports qui nous intéressent du conteneur aux ports de notre machine locale. Ici le port 80 (HTTP) et le port 3306 (MySQL).

    L'option **–restart=always** permet de relancer le conteneur à chaque démarrage de Docker (donc au démarrage de l'ordinateur, la nouvelle LAMPP stack est toujours lancée). 

    Quand cette commande est lancée, Linux télécharge le container et la LAMPP stack peut s'utiliser ensuite directement. On peut accéder à notre serveur web à partir de http://localhost
    
    La base de donnée sera alors sauvegardé sur ~/Documents/docker_cours/mysql.
    PhpMyAdmin est accessible sur http://localhost/phpmyadmin
    Avec cette image Docker l'utilisateur par défaut pour les bases de données devrait être **admin** avec le mot de passe **admin** (hôte localhost). 
    
- <u>méthode avancée</u>:
    Il est recommandé d'avoir un container par executables autant que possible. Donc nous avons besoin d'une image pour *Apache* avec *PHP*, une image pour *MySQL* et une image pour *phpMyAdmin*. 
        
    Pour Apache/PHP nous allons choisir l'image fournie ici (https://hub.docker.com/r/lavoweb/php-5.6/).
    Pour MySQL, nous pouvons prendre l'image fournie officiellement par MySQL, en version 5.5 (https://hub.docker.com/_/mysql/).
    Pour phpMyAdmin, nous pouvons aussi choisir l'image officielle (https://hub.docker.com/r/phpmyadmin/phpmyadmin/).

    #### 2.c.1.  Installation de docker-compose
     `docker-compose`est un outil qui permet de combiner plusieurs containers en un seul container.
     ```bash     
     patou@pc-pa:~/Documents/docker_cours$ sudo apt-get install docker-compose
     ```
    #### 2.c.2.  Creation d'un fichier docker-compose.yml
            
    Le contenu de notre fichier `docker-compose.yml` est:
    
    ```
    version: '2'

    services:
        web:
            image: lavoweb/php-5.6
            ports:
                - "80:80"
            volumes:
                - ~/Documents/docker_cours/www:/var/www/html
            links:
                - db:db
        db:
            image: mysql:5.5
            volumes:
                - ~/Documents/docker_cours/mysql:/var/lib/mysql
            ports:
                - "3306:3306"
            environment:
                - MYSQL_ROOT_PASSWORD=root
        myadmin:
            image: phpmyadmin/phpmyadmin
            ports:
                - "8080:80"
            links:
                - db:db
    ```
    - Explication:
        Les services sont des conteneurs: **web**, **db** et **myadmin** sont les noms qu'on décide de leur donner.

        Ces noms sont utilisés pour créer des liens - **links** - entre les différents conteneurs. Par ex. **db:db** signifie que notre conteneur db (du nom de notre conteneur MySQL) correspondra à l'hôte db dans notre conteneur web. Pour se connecter au serveur MySQL il faudra donc entrer **db** comme nom d'hôte.

        On peut également passer des variables d'environnements à nos conteneurs. Ici nous définissons le mot de passe de l'utilisateur MySQL root comme étant root (par `MYSQL_ROOT_PASSWORD` comme variable d'environnement)

        Le paramètre **volumes** relie les répertoires locaux `~/Documents/docker_cours/www` et `~/Documents/docker_cours/mysql` aux répertoires `/var/www/html` de l'image Apache/PHP et `/var/lib/mysql` de l'image MySQL dans nos conteneurs. Cela correspond à l'options **-v** de la ligne de commande, décrit dans la méthode simple. 

        Et le paramètre **ports** de la même manière que l'options **-p**, relie les ports qui nous intéressent de nos conteneurs aux ports de notre machine locale. Ici le port 80 (HTTP) et le port 3306 (MySQL). 
    
  #### 2.c.3.  Lancement des containers
  
  Une fois que le fichier yml est mis en place, on peut lancer les containers.
    ```bash
        patou@pc-pa:~/Documents/docker_cours$ sudo docker-compose up
        Creating network "dockercours_default" with the default driver
        Pulling db (mysql:5.5)...
        5.5: Pulling from library/mysql
        743f2d6c1f65: Pull complete
        3f0c413ee255: Pull complete
        aef1ef8f1aac: Pull complete
        f9ee573e34cb: Pull complete
        3f237e01f153: Pull complete
        03da1e065b16: Pull complete
        04087a801070: Pull complete
        7efd5395ab31: Pull complete
        1b5cc03aaac8: Pull complete
        2b7adaec9998: Pull complete
        385b8f96a9ba: Pull complete
        Digest: sha256:12da85ab88aedfdf39455872fb044f607c32fdc233cd59f1d26769fbf439b045
        Status: Downloaded newer image for mysql:5.5
        Pulling myadmin (phpmyadmin/phpmyadmin:latest)...
        latest: Pulling from phpmyadmin/phpmyadmin
        000eee12ec04: Downloading [==========================>                        ]  14.23MB/27.09MB
        8ae4f9fcfeea: Download complete
        60f22fbbd07a: Downloading [========>                                          ]  12.87MB/76.65MB
    ```
    
    Il faut attendre une peu que les images soient téléchargées, et c'est tout ! Notre serveur est en route. 
    
    (Je ne sais pas pourquoi mais mon serveur web n'arrivati pas à atteindre ma page sans reboot - peut-être à cause du fait que je viens d'installer docker from scratch)
    
    **<u>Rappel:</u>** 
    Nous savons que les containers docker ne sont pas persistant par défaut. Cela siginifie que lorsque nous modifions le container en cours d'utilisation, ces modifications seront perdues si on redemarre le container.
    Pour pouvoir rajouter des fichiers à notre LAMPP stack, nous avons donc utilisé la section "volumes" dans le fichier yml.
    
    #### 2.c.4.  Tester Apache
    Pour tester apache, nous allons créer un fichier index.php dans `~/Documents/docker_cours/www`. 
    On va aller dans un navigateur et taper `http://localhost` mais on n'aura rien en réponse car on n'a pas de page à voir.
    ![Drag Racing](./portage_joomla/apache.png)
    
    Nous allons donc, juste créer un fichier `index.php` dedans afin de tester notre serveur web.
    
     ```php
        <html>
          <head>
            <title></title>
            <meta content="">
            <style></style>
          </head>
          <body>
            <?php
                phpinfo();
            ?>
          </body>
        </html>
     ```
    Après la création du fichier, il faut éteindre et redemarrer le seveur.
    
    ```bash 
    patou@pc-pa:~/Documents/docker_cours$ docker-compose down
    Stopping dockercours_web_1 ... done
    Stopping dockercours_myadmin_1 ... done
    Stopping dockercours_db_1 ... done
    Removing dockercours_web_1 ... done
    Removing dockercours_myadmin_1 ... done
    Removing dockercours_db_1 ... done
    Removing network dockercours_default
    patou@pc-pa:~/Documents/docker_cours$ docker-compose up -d
    Creating network "dockercours_default" with the default driver
    Creating dockercours_db_1
    Creating dockercours_myadmin_1
    Creating dockercours_web_1
    ```
    
    Et maintenant:
    ![test apache](./portage_joomla/apache2.png)
    
    Et pour PhpMyAdmin, on a également localhost mais avec le port 8080 (voir fichier yml). Le login/mot de passe est: root root
    
    ![test apache](./portage_joomla/phpmyadmin.png)
    
    #### 2.c.5.  Accéder à notre stack LAMPP en ligne de commande
    Il pourrait être utile de savoir comment accéder à chaque process de notre docker machine.
    - Si je souhaiterais accéder à ma base SQL en ligne de commande:
      il faut retrouver le nom du module dans le fichier `docker-compose.yml` (ici c'est `db`). La commande est la suivante, et le résultat est une console de commande en tant que `root` à notre machine linux qui contient le process de database.
      
        ```bash
        patou@pc-pa:~/Documents/docker_cours$ docker-compose exec db /bin/bash
        root@fc5b8b4b8c94:/# 

        ```
     Pour sortir de la machine, il faut taper `exit`. 
     Nous allons essayer de nous connecter au processus `mysql`en mode console. Nous allons nous connecter en tant qu'utilisateur `root`
        
     ```bash
        patou@pc-pa:~/Documents/docker_cours$ docker-compose exec db /bin/bash
        root@fc5b8b4b8c94:/#mysql -u root -p
        Enter password: 
        Welcome to the MySQL monitor.  Commands end with ; or \g.
        Your MySQL connection id is 1
        Server version: 5.5.62 MySQL Community Server (GPL)

        Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

        Oracle is a registered trademark of Oracle Corporation and/or its
        affiliates. Other names may be trademarks of their respective
        owners.

        Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

        mysql>
    ```
     
    On peut également afficher toutes les bases de données dans notre `MySQL`
     ```bash
        mysql> show databases;
        +--------------------+
        | Database           |
        +--------------------+
        | information_schema |
        | mysql              |
        | performance_schema |
        +--------------------+
        3 rows in set (0.00 sec)
     ```
     
  - De la même manière, on pourra accéder au service web (apache), lire les fichiers de configurations (ou les modifier). Les modifications seront persistantes si on modifie la machine. ( à remarquer que les 2 fichiers que nous voyons ci-dessous sont nos )
     ```bash
        patou@pc-pa:~/Documents/docker_cours$ docker-compose exec web /bin/bash
        root@f82fea97bcb2:/var/www/html# ls
        index.html  index.php
        root@f82fea97bcb2:/var/www/html# exit
     ```

### 2.d Installation de Joomla

On télécharge joomla sur https://downloads.joomla.org/fr. Nous allons créer un répertoire joomla dans `www`, et y décompresser les fichiers fournis dans le fichier joomla.zip.
Il faut ensuite s'assurer qu'on a les accès correctes. Pour cela, il faudra que joomla ait l'accès en écriture au répertoire et sous-répertoire dans joomla. 

Relancer nos serveurs par la commande `docker-compose up -d`
Ouvrez le serveur web en mode ligne de commande: c'est le service nommé `web` dans le fichier yml.
   ```bash
   patou@pc-pa:~/Documents/docker_cours/www$ docker-compose exec web /bin/bash
   ```
   à partir de là, nous avons une console en mode root qui est notre serveur web.
   
   ```bash
   root@a0d8ce0e9193:/var/www/html# ls -la
    total 13632
    drwxr-xr-x  3 1000 1000     4096 Dec 29 11:57 .
    drwxr-xr-x  1 root root     4096 Nov 22 15:47 ..
    -rwxr-xr-x  1 1000 1000 13942196 Dec 20 10:28 Joomla_3.9.11-Stable-Full_Package.zip
    -rwxr-xr-x  1 1000 1000       24 Dec 20 14:56 index.php
    drwxr-xr-x 18 1000 1000     4096 Dec 29 11:57 joomla
   root@a0d8ce0e9193:/var/www/html# cd joomla/
   root@a0d8ce0e9193:/var/www/html/joomla# ls -la
    total 116
    drwxr-xr-x 18 1000 1000  4096 Dec 29 11:57 .
    drwxr-xr-x  3 1000 1000  4096 Dec 29 11:57 ..
    -rw-r--r--  1 1000 1000 18092 Dec 17 09:01 LICENSE.txt
    -rw-r--r--  1 1000 1000  4793 Dec 17 09:01 README.txt
    drwxr-xr-x 11 1000 1000  4096 Dec 29 11:57 administrator
    drwxr-xr-x  2 1000 1000  4096 Dec 29 11:57 bin
    drwxr-xr-x  2 1000 1000  4096 Dec 29 11:57 cache
    drwxr-xr-x  2 1000 1000  4096 Dec 29 11:57 cli
    drwxr-xr-x 20 1000 1000  4096 Dec 29 11:57 components
    -rw-r--r--  1 1000 1000  3159 Dec 17 09:01 htaccess.txt
    drwxr-xr-x  5 1000 1000  4096 Dec 29 11:57 images
    drwxr-xr-x  2 1000 1000  4096 Dec 29 11:57 includes
    -rw-r--r--  1 1000 1000  1420 Dec 17 09:01 index.php
    drwxr-xr-x 14 1000 1000  4096 Dec 29 11:57 installation
    drwxr-xr-x  4 1000 1000  4096 Dec 29 11:57 language
    drwxr-xr-x  5 1000 1000  4096 Dec 29 11:57 layouts
    drwxr-xr-x 12 1000 1000  4096 Dec 29 11:57 libraries
    drwxr-xr-x 30 1000 1000  4096 Dec 29 11:57 media
    drwxr-xr-x 27 1000 1000  4096 Dec 29 11:57 modules
    drwxr-xr-x 19 1000 1000  4096 Dec 29 11:57 plugins
    -rw-r--r--  1 1000 1000   829 Dec 17 09:01 robots.txt.dist
    drwxr-xr-x  5 1000 1000  4096 Dec 29 11:57 templates
    drwxr-xr-x  2 1000 1000  4096 Dec 29 11:57 tmp
    -rw-r--r--  1 1000 1000  1859 Dec 17 09:01 web.config.txt
   root@a0d8ce0e9193:/var/www/html/joomla# 
   ```
   On remarque que seul le propriétaire du répertoire (donc l'utilisateur créateur) peut écrire dedans (pour plus de compréhension, voir ici: https://www.it-connect.fr/les-droits-sous-linux ). Il faudra donner les droits d'écriture aux `autres` utilisateurs. 
   
   ```bash
   root@a0d8ce0e9193:/var/www/html# chmod 777 -R joomla/
   root@a0d8ce0e9193:/var/www/html# ls -la
    total 13632
    drwxr-xr-x  3 1000 1000     4096 Dec 29 11:57 .
    drwxr-xr-x  1 root root     4096 Nov 22 15:47 ..
    -rwxr-xr-x  1 1000 1000 13942196 Dec 20 10:28 Joomla_3.9.11-Stable-Full_Package.zip
    -rwxr-xr-x  1 1000 1000       24 Dec 20 14:56 index.php
    drwxrwxrwx 18 1000 1000     4096 Dec 29 11:57 joomla
   root@a0d8ce0e9193:/var/www/html# cd joomla
   root@a0d8ce0e9193:/var/www/html/joomla# ls -la
    total 116
    drwxr-xr-x 18 1000 1000  4096 Dec 29 11:57 .
    drwxr-xr-x  3 1000 1000  4096 Dec 29 11:57 ..
    -rwxrwxrwx  1 1000 1000 18092 Dec 17 09:01 LICENSE.txt
    -rwxrwxrwx  1 1000 1000  4793 Dec 17 09:01 README.txt
    drwxrwxrwx 11 1000 1000  4096 Dec 29 11:57 administrator
    drwxrwxrwx  2 1000 1000  4096 Dec 29 11:57 bin
    drwxrwxrwx  2 1000 1000  4096 Dec 29 11:57 cache
    drwxrwxrwx  2 1000 1000  4096 Dec 29 11:57 cli
    drwxrwxrwx 20 1000 1000  4096 Dec 29 11:57 components
    -rwxrwxrwx  1 1000 1000  3159 Dec 17 09:01 htaccess.txt
    drwxrwxrwx  5 1000 1000  4096 Dec 29 11:57 images
    drwxrwxrwx  2 1000 1000  4096 Dec 29 11:57 includes
    -rwxrwxrwx  1 1000 1000  1420 Dec 17 09:01 index.php
    drwxrwxrwx 14 1000 1000  4096 Dec 29 11:57 installation
    drwxrwxrwx  4 1000 1000  4096 Dec 29 11:57 language
    drwxrwxrwx  5 1000 1000  4096 Dec 29 11:57 layouts
    drwxrwxrwx 12 1000 1000  4096 Dec 29 11:57 libraries
    drwxrwxrwx 30 1000 1000  4096 Dec 29 11:57 media
    drwxrwxrwx 27 1000 1000  4096 Dec 29 11:57 modules
    drwxrwxrwx 19 1000 1000  4096 Dec 29 11:57 plugins
    -rwxrwxrwx  1 1000 1000   829 Dec 17 09:01 robots.txt.dist
    drwxrwxrwx  5 1000 1000  4096 Dec 29 11:57 templates
    drwxrwxrwx  2 1000 1000  4096 Dec 29 11:57 tmp
    -rwxrwxrwx  1 1000 1000  1859 Dec 17 09:01 web.config.txt
   ```

On va aller dans `http://locahost/joomla` et le programme d'installation de joomla commence. Vous remplirez avec les informations qui correspondent à votre site. J'ai aussi mis `admin` et `admin` pour le compte super-utilisateur.(ATTENTION: si vous décompressez dans un autre répertoire, il faudra mettre ce répertoire dans l'adresse également `http://locahost/repertoire`)

![install joomla](./portage_joomla/configuration_joomla_site.png)

Et cliquez `suivant`
Avant d'aller créer la base de donnée, pensez à vérifier dans phpmyadmin (`http://localhost:8080`) que la base de donnée que vous souhaitez créer n'est pas déjà existant.

L'étape 2 consiste à configurer la base de données MySQL (le nom d'utilisateur de notre base MySQL est root - souvenez-vous et sont mot de passe est aussi root). 
Pour tester nous allons garder cela (même si la plus raisonnable en terme de sécurité est de créer un utilisateur et de faire une commande SQL )
J'ai nommé ma base de donnée `Omnifood`. Il faudra créer cette base en utilisant soit la ligne de commande `MySQL`soit `PhpMyAdmin`. Nous allons utiliser `phpMyAdmin` dans une autre page.

![test apache](./portage_joomla/phpmyadmin_2.png). 

Juste pour remarquer que nous avons bien la même base de donnée que ce que nous accédons en ligne de commande dans phpmyAdmin car on retrouve bien la même liste de bases de données dans PhpMyAdmin et dans MySQL en ligne de commande:

![test db](./portage_joomla/bases_existants.png)



Nous allons ensuite commencer par créer un utilisateur autre que root: que nous allons appeler `devsite` et dont le mote de passe est `devsite` et dans privileges, nous allons donner tous les droits pour commencer (plus tard, il faudra limiter ces droits)

![test db](./portage_joomla/config_new_user.png)

Cliquer ensuite sur `Executer` pour rajouter l'utilisateur. Deconnectez-vous de phpMyAdmin et reconnectez-vous avec l'utilisateur `developpeur`

Nous allons ensuite créer une base de données. Pour ma part, elle s'appelera `Omnifood`. Cliquez sur le menu de gauche `Nouvelle base de donnée` et nommez votre base de donnée selon le site et cliquez sur créer. Pas besoin de créer des tables, car joomla va les créer.
  
![install joomla](./portage_joomla/configuration_joomla_db.png)
  
Le nom du serveur est le nom de la machine contenant la base de donnée (dans notrefichier yml, notre serveur de base de donnée est `db`. Le nom de la base est (pour moi) `Omnifood` et le nom d'utilisateur est `developpeur` et le mot de passe de cet utilisateur est `devsite`). 



Un dernier détail: il faut rajouter la ligne ci-dessous à nos services docker pour désactiver la vérification que fait Joomla sur les bases de données docker:
   ```
   environment:
        - JOOMLA_INSTALLATION_DISABLE_LOCALHOST_CHECK=1
   ```
Cliquez ensuite sur `Suivant`. Dans la troisième étape, ne rien toucher et cliquez sur `Suivant`. Et enfin dans l'étape 4, cliquez sur `Aucune donnée exemple`  et cliquez sur `Installation`. Attendre la fin de l'installation.

![install joomla](./portage_joomla/Joomla_installation_fini.png) 

ATTENTION: BIEN LIRE les instructions de fin d'installation jusqu'à la fin car il y a des choses à faire.

Une fois que l'installation est effectué, vous pourrez accéder à notre site sur `http://localhost/joomla/`
et à l'interface d'administration sur `http://localhost/joomla/administrator`
  
Remarque: Après l'installation de Joomla, on rencontre une erreur de version de php quand on rentre sur l'interface d'administration. Il faut remplacer la version de php par la version 7.3 pour se débarasser de ces erreurs. 

Après plusieurs essais avec différentes version de PHP, on rencontre un problème d'accès à la base MSySQL. 
Il faut alors qu'on remplace également notre base de donnée par une version de MariaDB.

Nous allons alors remplacer notre ficher docker-compose.yml comme ceci:
   ```
    version: '2.0'
    services:
            web:
                image: lavoweb/php-7.3
                ports:
                    - "80:80"
                volumes:
                    - ~/Documents/docker_cours/www:/var/www/html
                links:
                    - db:db
                environment:
                    - JOOMLA_INSTALLATION_DISABLE_LOCALHOST_CHECK=1
            db:
                image: mariadb:10.4
                volumes:
                    - ~/Documents/docker_cours/mysql:/var/lib/mysql
                ports:
                    - "3306:3306"
                environment:
                    - MYSQL_ROOT_PASSWORD=root
                    - JOOMLA_INSTALLATION_DISABLE_LOCALHOST_CHECK=1
            myadmin:
                image: phpmyadmin/phpmyadmin
                ports:
                    - "8080:80"
                links:
                    - db:db
                environment:
                    - JOOMLA_INSTALLATION_DISABLE_LOCALHOST_CHECK=1
   ```
  
  Nous avons remplacé la version de php par la version 7.3 et la base de donnée par MariaDB version 10.4.
  
  Ensuite, il nous faudra supprimer Joomla dans le répertoire www afin d'en installer une nouvelle après avoir recomposer notre machine docker par `docker-compose up -d` (`-d` signifie en mode détaché, c'est à dire que les services tournent en tâche de fond sans acaparer une console entière). Refaire ensuite toute la partie installation de Joomla en s'assurant de ne pas mettre le site exemple .
  
  A ce stade, vous devriez avoir un joomla installé et configuré (prêt à l'utilisation). 
  Vous devriez pouvoir tester cela sur `http://localhost/joomla/`, qui devrait nous donner un site exemple vide.
  
  ![install joomla](./portage_joomla/joomla_site_vide.png) 
  
  <u>Remarque:</u>:
  S'il vous arrive d'avoir les warnings suivants:
  
  ```bash
    patou@pc-pa:~/Documents/docker_cours$ docker-compose up -d
    Creating dockercours_db_1
    WARNING: Connection pool is full, discarding connection: localhost
    Creating dockercours_web_1
    WARNING: Connection pool is full, discarding connection: localhost
    Creating dockercours_myadmin_1
  ```
  
  La solution est la suivante: 
  
  ```bash
  patou@pc-pa:~/Documents/docker_cours$ export DOCKER_CLIENT_TIMEOUT=120
  patou@pc-pa:~/Documents/docker_cours$ docker-compose up -d
  dockercours_db_1 is up-to-date
  dockercours_web_1 is up-to-date
  dockercours_myadmin_1 is up-to-date 
  ```
   Plus de warning. Pour plus d'information, la doc est ici (https://github.com/docker/compose/issues/1045)
  
  ## 3. Formation Joomla pour commencer
  
  
  Avant de commencer, il faut savoir que ce cours est déjà assez ancien et fonctionne avc php5 et mysql5. il nous faudra donc modifier notre fichier `docker-compose.yml` comme suit:
  
  ```conf
version: '2'
services:
    web:
        image: lavoweb/php-5.6
        ports:
            - "80:80"
        volumes:
            - ~/Documents/docker_cours/www:/var/www/html
        links:
            - db:db
        environment:
            - JOOMLA_INSTALLATION_DISABLE_LOCALHOST_CHECK=1
    db:
        image: mysql:5.7
        volumes:
            - ~/Documents/docker_cours/mysql5:/var/lib/mysql
        ports:
            - "3306:3306"
        environment:
            - MYSQL_ROOT_PASSWORD=root
            - JOOMLA_INSTALLATION_DISABLE_LOCALHOST_CHECK=1
    myadmin:
        image: phpmyadmin/phpmyadmin
        ports:
            - "8080:80"
        links:
            - db:db
        environment:
            - JOOMLA_INSTALLATION_DISABLE_LOCALHOST_CHECK=1
  ```
  
  et relancer `docker-compose up -d`.
  
  ### 3.1. Restauration d'un site joomla à partir d'une sauvegarde
  Nous allons commencer par comprendre comment on peut restorer un site dans Joomla.
  (Avant d'apprendre à sauvegarder notre site, nous allons déjà apprendre ) le restaurer.
  
  Un site Joomla sauvegardé est composé de deux éléments: 
    - un fichier d'installation de joomla (zippé) qui contient déjà un site.
    - un fichier base de donnée (*.sql).
  
  Les 2 fichiers seront fournies en attachement à ce chapitre avec le commit.
  
  - Pour restaurer le site, il suffit de dezipper le fichier et de copier le fichier dans la racine du répertoire où nous mettons nos installations de Joomla (pour nous ce sera `www`) - Nous allons garder le nom du répertoire `01_05`. Si vosu lancer votre serveur LAMPP (dans docker) et que vous essayez d'utiliser le site, il y aura un problème car le site n'a pas de base de donnée (essayer d'entrer dans un navigateur `http://localhost/01_05`, vous aurez un message d'erreur  concernant la fonction `session_start()`).
  - Nous allons donc restaurer également la base de donnée de ce site. 
    * ouvrir phpmyadmin (`http://localhost:8080`), cliquez sur l'onglet `base de donnée`.
    * ouvrir le fichier `01_05/configuration.php` dans un éditeur et cherchez dans ce fichier le nom de la base de donnée et les mots de passe de la base de donnée. Nous nous interessons particulièrement aux données suivantes: 
    
    ``` java
        public $user = 'root';
        public $password = '';
        public $db = 'joomla';
    ```
    On va modifier `$password='root'`.
    * il nous faut également créer manuellement la base de donnée `joomla` dans phpmyadmin. Pour cela, cliquez, sur l'onglet `Base de données` et entrer le nom de la base de donnée (joomla) et cliquez sur `Créer`.
    
      ![install joomla](./portage_joomla/import_db_site_joomla.png)
    * Vous allez alors trouver sur la partie de droite, la base de donnée nouvellement créée. Il faut maintenant importer le fichier sql. Pour cela, cliquez sur la base de donnée `joomla` et ensuite dans l'onglet `importer`. Ensuite vous avez un bouton `Parcourir...`et trouver le fichier `01_05.sql`. Ensuite tout en bas  de la page, cliquer sur `Executer`. Si tout s'est bien passé, on aura: `L'importation a réussi`.

    * enfin, en entrant sur le liens `localhost/01_05`, on a le site KinetECO qui s'affiche comme suit:
     ![install joomla](./portage_joomla/kinetECO_empty_site.png).
    
#### a. Tour rapide de l'interface Joomla (on le fera ensemble-pas besoin de doc)
L'idée est de voir un à un les menus de Joomla et de comprendre le rôle de ces menus.

#### b. Configuration du site KinetECO dans Joomla
Ouvrez le backend de Joomla et allez dans Global Configuration (ou Menu Système > Global Configuration). Vous avez alors la possibilité de voir toutes les configurations du site. 

![config joomla](./portage_joomla/Global_configuration_joomla.png).

- Commencer par changer le nom du site de `KinetECO` à `KinetECO, Inc.` dans la zone `Site Name`.
_ Modifier l'option `Site Offline` à `Yes`. Cela permettra de mettre un login à notre site si le site est maintenance et donc seul les personnes qui ont un login auront accès au site. (testez-le mais remettez l'option à `No` un fois que vous aurez fini de tester, pour avoir plus de faciliter à travailler en local).  
<br>Dans les options qui suivent, on peut également customiser un message d'erreur à afficher lorsque le site est en maintenance.
- <u>Sur la partie de droite on a `Search Engine Friendly URLs`</u> qui permet d'avoir des URL qui sont optimisés pour être référencés par les moteurs de recherche.
- <u>L'option `Include Site Name in Page Titles`</u>: est une option importante à activer. Cela permet d'avoir le nom du site avec le titre de la page. En effet, si vous ouvrez la page d'accueil de notre site, on a `Home` à l'onglet de notre page. Cependant, ce titre n'est pas un titre très descriptif de notre site. De plus, les moteurs de recherche donnent des points aux mots et si le titre n'est pas descriptif de notre site, il ne sert à rien. Il en est de même pour les favoris: si j'essaye de mettre cette page en favori, il y aura un titre `Home` dans mes favoris mais rien de très descriptif de ce que c'est. Pour toutes ces raisons, nous allons activer cette option à `Before` et sauvegarder la modification (bouton `Save` en dessus). Tester la modification en rafraichissant la page et vous verrez que le titre de la page sera `KinetECO,Inc. Home` (au lieu de `Home`).
- <u>Configuration des méta-data</u>: Dans la partie `Metadata Setting`, on peut configurer les metadata. et rajouter des mots clés ou des descriptions. Pour KinetEco, nous avons un fichier avec des metadata dans `Exercise Files/Chapter 2/02_03/meta description.txt`. Copier le contenu de ce fichier dans `Site Meta Description`. Ce méta description apparaitra sur toutes les pages de notre site suf si on décide de surcharger articles par articles (donc page par page) en définissant une meta description pour chaque article. Les meta description des sites doivent être courts et simple car ils sont utilisés par les moteurs de recherche pour référencer le site.

- Dans l'onglet `System` de l'option `Global Configuration`, on a `Session Settings`, et on y trouve `Session lifetime`, c'estle temps pour laquelle vous êtes loggé et si vous êtes inactif pendant le temps fourni, votre session est deconnecté. 
- Dans l'onglet `Server`, on a la possibilité de changer le fuseau horaire. Dans notre cas, on pourra choisir `Paris`au lieu de `UTC`. 
- On y retrouve également `Mail setting`. Il n'est pas recommandé de toucher aux configurations de `FTP` et de `Database`.
- Dans l'onglet `Permissions`, il existe plein de configuration que nous verrons en détails lorsque nous verrons les ACL (Access Control List).
- Le dernier onglet est `Text filter`, que nous verrons en détails également plus tard.


#### c. Utilisation du `Media manager`
Le `media manager` est l'interface qui vous permettra d'uploader des fichiers images (ou pdf) que vous servirez sur le site pour les usagers du site. C'est également à cet endroit que vous pourrez organiser ces documents par dossier.
Pour y accéder `System > Control Panel` et choisir `Media Manager`dans la partie de droite (ou à partir du menu `Content > Media Manager`). Par défaut, on a la structure qui s'affiche pour tous les sites.

(Prendre le fichier training.zip et décompresser dans un répertoire où vous pourrez y accéder)
Dans le répertoire racine, nous allons commencer par créer un répertoire nommé `blog`, en cliquant sur `create folder`. Ensuite, nous allons uploader les fichiers images qui sont dans `Exercise Files/Chapter 2/02_04/` et cliquez sur `Start Upload`. 

#### d. Creation d'un contenu sous Joomla 

Il faut les trois étapes CAM:
- créer une catégorie
- créer un article
- créer un menu pour lier avec l'article

L'ordre de ces étapes sont importantes car les données sont enregistrés dans la base de donnée. Il faut donc respecter l'ordre CAM.







