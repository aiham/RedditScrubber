-- MySQL dump 10.11
--
-- Host: localhost    Database: reddit_scrubber
-- ------------------------------------------------------
-- Server version	5.0.96


--
-- Table structure for table `Processes`
--

CREATE TABLE `Processes` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(255) default NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `RedditUsers`
--

CREATE TABLE `RedditUsers` (
  `id` int(11) NOT NULL auto_increment,
  `reddit_id` varchar(255) default NULL,
  `username` varchar(255) default NULL,
  `access_token` text,
  `refresh_token` text,
  `posts_deleted` int(11) default '0',
  `comments_deleted` int(11) default '0',
  `last_login` datetime default NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `Sessions`
--

CREATE TABLE `Sessions` (
  `sid` varchar(255) NOT NULL default '',
  `data` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY  (`sid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `Tasks`
--

CREATE TABLE `Tasks` (
  `id` int(11) NOT NULL auto_increment,
  `type` enum('all','posts','comments') default NULL,
  `status` enum('queued','wiping','complete','canceled') default NULL,
  `posts_deleted` int(11) default '0',
  `comments_deleted` int(11) default '0',
  `wipe_start` datetime default NULL,
  `end` datetime default NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ProcessId` int(11) default NULL,
  `RedditUserId` int(11) default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- Dump completed on 2014-07-31  8:08:33
