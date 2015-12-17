DROP TABLE IF EXISTS `pages`;
CREATE TABLE `pages` (
  `itemid` int(11) NOT NULL DEFAULT '0',
  `guid` varchar(255) NOT NULL DEFAULT '',
  `gameid` int(11) DEFAULT '0',
  `title` varchar(255) NOT NULL DEFAULT '',
  `author` varchar(128) NOT NULL DEFAULT '',
  `from` varchar(100) NOT NULL DEFAULT '',
  `pkgname` varchar(128) NOT NULL DEFAULT '',
  `keywords` varchar(255) NOT NULL DEFAULT '',
  `description` varchar(255) NOT NULL DEFAULT '',
  `checked` tinyint(1) NOT NULL DEFAULT 0,
  `showed` tinyint(1) NOT NULL DEFAULT 0,
  `createtime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updatetime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `stamp` varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY (`itemid`)
) DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `contents`;
CREATE TABLE `contents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `itemid` int(11) NOT NULL DEFAULT '0',
  `kindid` int(11) NOT NULL DEFAULT '0',
  `sortorder` int(11) DEFAULT '0',
  `data` TEXT NOT NULL,
  `extra` varchar(4) DEFAULT '',
  PRIMARY KEY (`id`),
  INDEX(`itemid`)
) AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `pviews`;
CREATE TABLE `pviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `itemid` int(11) NOT NULL DEFAULT '0',
  `count` int(11) NOT NULL DEFAULT '0',
  `extra` varchar(128) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `itemid` int(11) NOT NULL DEFAULT '0',
  `uid` varchar(64) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `like_idx` (`itemid`,`uid`)
) AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `contentkind`;
CREATE TABLE `contentkind` (
  `id` int(11) DEFAULT NULL AUTO_INCREMENT,
  `name` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`)
)AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `items`;
CREATE TABLE `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parentid` int(11) NOT NULL DEFAULT 0,
  `isroot` tinyint(1) NOT NULL DEFAULT 0,
  `title` varchar(128) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `thumbnails`;
CREATE TABLE `thumbnails` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `itemid` int(11) NOT NULL DEFAULT 0,
  `src` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(128) NOT NULL DEFAULT '-',
  `name` varchar(128) NOT NULL DEFAULT '-',
  `password` char(64) DEFAULT NULL,
  `level` int(11) NOT NULL DEFAULT '0',
  `badlogins` int(11) NOT NULL DEFAULT '0',
  `maxbadlogins` int(11) NOT NULL DEFAULT '999',
  `active` char(1) NOT NULL DEFAULT 'Y',
  `email` varchar(128) NOT NULL DEFAULT '',
  `note` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_idx` (`username`,`active`)
) AUTO_INCREMENT=200 DEFAULT CHARSET=utf8;