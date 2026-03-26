import { manPages } from "@/types/man";
import type { AppId } from "@/types/app";

/**
 * Parse and execute a spell command string, returning the appId and props
 * needed to open a window.
 *
 * Returns null if the command is not recognized.
 */
export async function parseSpellCommand(
  commandLine: string,
): Promise<{ appId: AppId; props: any; commandString: string } | null> {
  const parts = commandLine.trim().split(/\s+/);
  const commandName = parts[0]?.toLowerCase();
  const cmdArgs = parts.slice(1);

  const command = manPages[commandName];
  if (!command) return null;

  const props = command.argParser
    ? await Promise.resolve(command.argParser(cmdArgs))
    : command.defaultProps || {};

  return { appId: command.appId, props, commandString: commandLine };
}
