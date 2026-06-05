/*
SQLyog Community
MySQL - 5.0.27-community-nt : Database - ariagro
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`ariagro` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `ariagro`;

/*Table structure for table `menusweb_usuarios` */

DROP TABLE IF EXISTS `menusweb_usuarios`;

CREATE TABLE `menusweb_usuarios` (
  `codusu` int(7) NOT NULL,
  `codigo` int(11) NOT NULL,
  `aplicacion` varchar(30) NOT NULL,
  `ver` tinyint(1) NOT NULL default '1',
  PRIMARY KEY  (`codusu`,`codigo`,`aplicacion`),
  KEY `FK_menus_usuarios` (`codigo`,`aplicacion`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `menusweb_usuarios` */

insert  into `menusweb_usuarios`(`codusu`,`codigo`,`aplicacion`,`ver`) values 
(0,1,'ariagro',1),
(0,2,'ariagro',0),
(0,3,'ariagro',1),
(1,1,'ariagro',0),
(1,2,'ariagro',0),
(1,3,'ariagro',0),
(2,1,'ariagro',0),
(2,2,'ariagro',0),
(2,3,'ariagro',0),
(3,1,'ariagro',0),
(3,2,'ariagro',1),
(3,3,'ariagro',0);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
