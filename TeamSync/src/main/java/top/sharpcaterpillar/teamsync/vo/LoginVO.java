package top.sharpcaterpillar.teamsync.vo;

public class LoginVO {

    /**
     * 访问令牌
     */
    private String token;

    /**
     * 刷新令牌
     */
    private String refreshToken;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

}

