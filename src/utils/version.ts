import semver from "semver";

export interface VersionCheck {
  updateAvailable: boolean;
  updateRequired: boolean;
}

export function checkVersion(
  clientVersion: string | undefined,
  latestVersion: string,
  minRequiredVersion: string,
): VersionCheck {
  const client = clientVersion ? semver.coerce(clientVersion) : null;
  if (!client) {
    return { updateAvailable: false, updateRequired: false };
  }

  const latest = semver.coerce(latestVersion);
  const minRequired = semver.coerce(minRequiredVersion);

  return {
    updateAvailable: latest ? semver.lt(client, latest) : false,
    updateRequired: minRequired ? semver.lt(client, minRequired) : false,
  };
}
