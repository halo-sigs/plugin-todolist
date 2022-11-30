package run.halo.tutorial;

import org.pf4j.PluginWrapper;
import org.springframework.stereotype.Component;
import run.halo.app.extension.Scheme;
import run.halo.app.extension.SchemeManager;
import run.halo.app.plugin.BasePlugin;

/**
 * @author guqing
 * @since 2.0.0
 */
@Component
public class HelloWorldPlugin extends BasePlugin {
    private final SchemeManager schemeManager;

    public HelloWorldPlugin(PluginWrapper wrapper, SchemeManager schemeManager) {
        super(wrapper);
        this.schemeManager = schemeManager;
    }

    @Override
    public void start() {
        schemeManager.register(Todo.class);
        System.out.println("Hello world 插件启动了!");
    }

    @Override
    public void stop() {
        Scheme todoScheme = schemeManager.get(Todo.class);
        schemeManager.unregister(todoScheme);

        System.out.println("Hello world 被停止!");
    }

    @Override
    public void delete() {
        System.out.println("Hello world 被卸载");
    }
}
