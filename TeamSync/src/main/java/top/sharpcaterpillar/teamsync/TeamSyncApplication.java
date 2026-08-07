package top.sharpcaterpillar.teamsync;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("top.sharpcaterpillar.teamsync.mapper")
@EnableAsync
@EnableScheduling
public class TeamSyncApplication {

    public static void main(String[] args) {
        SpringApplication.run(TeamSyncApplication.class, args);
    }

}
