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

/*Table structure for table `menusweb` */

DROP TABLE IF EXISTS `menusweb`;

CREATE TABLE `menusweb` (
  `codigo` int(11) NOT NULL,
  `aplicacion` varchar(30) NOT NULL,
  `padre` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `orden` int(11) NOT NULL,
  PRIMARY KEY  (`codigo`,`aplicacion`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `menusweb` */

insert  into `menusweb`(`codigo`,`aplicacion`,`padre`,`descripcion`,`orden`) values 
(1,'ariagroweb',1,'Pedidos',1),
(2,'ariagroweb',1,'Campos',2),
(3,'ariagroweb',1,'Comparativa Ventas',3);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
