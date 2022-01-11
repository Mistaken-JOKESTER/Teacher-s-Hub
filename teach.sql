
--
-- Table structure for table `class`
--

DROP TABLE IF EXISTS `teacher`;
CREATE TABLE `teacher` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(150) NOT NULL,
  `mobile` bigint NOT NULL,
  `google` tinyint NOT NULL DEFAULT '0',
  `webex` tinyint NOT NULL DEFAULT '0',
  `googleToken` text,
  `webexToken` text,
  PRIMARY KEY (`id`)
);


DROP TABLE IF EXISTS `class`;
CREATE TABLE `class` (
  `id` varchar(20) NOT NULL,
  `name` varchar(200) NOT NULL,
  `section` varchar(100) DEFAULT NULL,
  `discription_head` text,
  `discription` text,
  `class_code` varchar(45) NOT NULL,
  `link` text NOT NULL,
  `teacherGroupEmail` text,
  `courseGroupEmail` text,
  `teacher_id` bigint NOT NULL,
  `owner_id` varchar(30) NOT NULL,
  `tabled` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `c_to_t_idx` (`teacher_id`),
  CONSTRAINT `c_to_t` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

--
-- Table structure for table `gtoken`
--

DROP TABLE IF EXISTS `gtoken`;
CREATE TABLE `gtoken` (
  `id` bigint NOT NULL,
  `refreshToken` varchar(45) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `g_to_user_idx` (`user_id`),
  CONSTRAINT `g_to_user` FOREIGN KEY (`user_id`) REFERENCES `teacher` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `sid` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`sid`)
);


--
-- Table structure for table `teacher`
--


--
-- Table structure for table `timetable`
--

DROP TABLE IF EXISTS `timetable`;
CREATE TABLE `timetable` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `class_id` varchar(20) DEFAULT NULL,
  `teacher_id` bigint NOT NULL,
  `start_time` time NOT NULL,
  `day` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `c_to_t_idx` (`teacher_id`),
  CONSTRAINT `tt_to_t` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`)
);


--
-- Table structure for table `wtoken`
--

DROP TABLE IF EXISTS `wtoken`;
CREATE TABLE `wtoken` (
  `id` int NOT NULL AUTO_INCREMENT,
  `refreshToken` varchar(45) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `w_to_user_idx` (`user_id`),
  CONSTRAINT `w_to_user` FOREIGN KEY (`user_id`) REFERENCES `teacher` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);


DELIMITER ;;
CREATE PROCEDURE `addNewTeacher`(
	IN `in_name` varchar(60),
    IN `in_email` varchar(100),
    IN `in_password` varchar(150),
    IN `in_mobile` bigint
)
BEGIN
	INSERT INTO teacher(`name`, `email`, `password`, `mobile`) value (`in_name`, `in_email`, `in_password`, `in_mobile`);
END ;;
DELIMITER ;


DELIMITER ;;
CREATE PROCEDURE `updateToken`(
	IN `token` text,
    IN `type` tinyint,
    IN `user_id` bigint
)
BEGIN
	if(`type` = 1) then
		update teacher 
		set teacher.googleToken = `token`, teacher.google = 1
		where teacher.id = `user_id`;
	else 
		update teacher 
		set teacher.webexToken = `token`, teacher.webex = 1
		where teacher.id = `user_id`;
    end if;
	
END ;;
DELIMITER ;
